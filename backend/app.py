# app.py

from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os
from werkzeug.utils import secure_filename
from config import Config
from data_processor.parser import parse_and_validate_data 
import math # Diperlukan untuk cek NaN dan perhitungan batch

# --- Konfigurasi UPLOAD ---
UPLOAD_FOLDER = 'uploads' 
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}
# Ukuran batch untuk insert ke DB. Diatur rendah (100) untuk menghindari error max_allowed_packet.
BATCH_SIZE = 100 

# --- Inisialisasi Aplikasi ---
app = Flask(__name__)
app.config.from_object(Config)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app) 

# --- FUNGSI KONEKSI DATABASE ---
def get_db_connection():
    """
    Mencoba membuat koneksi ke database MySQL.
    Perintah SET SESSION telah dihapus karena konflik Read-Only.
    """
    try:
        conn = mysql.connector.connect(
            host=app.config['MYSQL_HOST'],
            user=app.config['MYSQL_USER'],
            password=app.config['MYSQL_PASSWORD'],
            database=app.config['MYSQL_DB']
        )
        # Koneksi berhasil, siap digunakan
        return conn
    except mysql.connector.Error as err:
        # Mencetak error spesifik ke konsol untuk debugging
        print(f"Error connecting to MySQL: {err}") 
        return None

# --- Fungsi Utility UPLOAD ---
def allowed_file(filename):
    """Validasi format file"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

# Fungsi helper untuk membersihkan NaN dari Pandas (Solusi untuk Error 1054: Unknown column 'nan')
def clean_nan_to_none(value):
    """Mengubah nilai NaN dari Pandas menjadi None yang diterima MySQL (NULL)."""
    # Mengecek apakah nilainya adalah float dan merupakan NaN
    if isinstance(value, float) and math.isnan(value):
        return None
    # Jika bukan NaN atau bukan float, kembalikan nilai aslinya
    return value

def save_data_to_db(data):
    """
    Menyimpan list of game records ke database MySQL menggunakan Batch Insert.
    Ini adalah implementasi fitur #1 (Upload Dataset) sisi backend.
    """
    conn = get_db_connection()
    if not conn:
        return 0, "Gagal terhubung ke database."

    query = """
    INSERT INTO games (name, price, release_date, review_no, review_type, tags, description)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    total_inserted_count = 0
    try:
        cursor = conn.cursor()
        
        # 1. Konversi data menjadi list of tuples DENGAN CLEANING
        values = [(
            clean_nan_to_none(d.get('name')), 
            clean_nan_to_none(d.get('price')), 
            clean_nan_to_none(d.get('release_date')), 
            clean_nan_to_none(d.get('review_no')), 
            clean_nan_to_none(d.get('review_type')), 
            clean_nan_to_none(d.get('tags')), 
            clean_nan_to_none(d.get('description'))
        ) for d in data]

        # 2. Implementasi Batch Insert untuk menghindari batasan max_allowed_packet
        num_batches = math.ceil(len(values) / BATCH_SIZE)
        
        for i in range(num_batches):
            start_index = i * BATCH_SIZE
            end_index = (i + 1) * BATCH_SIZE
            batch_values = values[start_index:end_index]
            
            cursor.executemany(query, batch_values)
            total_inserted_count += len(batch_values)
            
        conn.commit() # Commit semua batch
        
    except mysql.connector.Error as err:
        conn.rollback()
        return 0, f"Gagal menyimpan data ke database: {err}"
    finally:
        if 'cursor' in locals():
            cursor.close()
        conn.close()
        
    return total_inserted_count, "Data berhasil disimpan."


# --- Rute Sederhana ---
@app.route('/', methods=['GET'])
def home():
    return jsonify({"message": "Backend Steam Analysis API berjalan!", "status": "ok"})

# Rute untuk menguji koneksi DB
@app.route('/test-db', methods=['GET'])
def test_db():
    conn = get_db_connection()
    if conn:
        conn.close()
        return jsonify({"message": "Koneksi database berhasil!"}), 200
    else:
        return jsonify({"message": "Koneksi database gagal! Cek konsol Flask untuk detail error MySQL."}), 500

# --- Rute Upload Dataset (Fitur #1 & #2) ---
@app.route('/upload-dataset', methods=['POST'])
def upload_dataset():
    """Endpoint untuk mengunggah dan memproses dataset."""
    
    if 'file' not in request.files:
        return jsonify({"message": "Tidak ada file yang diunggah."}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({"message": "Nama file kosong."}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Simpan file sementara
        try:
            if not os.path.exists(app.config['UPLOAD_FOLDER']):
                os.makedirs(app.config['UPLOAD_FOLDER'])
            file.save(file_path)
        except Exception as e:
            return jsonify({"message": f"Gagal menyimpan file di server: {e}"}), 500

        # Parsing dan Validasi Data (memanggil parser.py)
        file_extension = os.path.splitext(filename)[1].lower()
        data_to_insert, message = parse_and_validate_data(file_path, file_extension)
        
        # Hapus file sementara setelah diproses
        os.remove(file_path) 

        if data_to_insert is None:
            return jsonify({"message": f"Parsing Gagal: {message}"}), 422

        # Simpan data yang sudah bersih ke Database
        inserted_count, db_message = save_data_to_db(data_to_insert)

        if inserted_count > 0:
            return jsonify({
                "message": f"Dataset berhasil diunggah dan {inserted_count} record disimpan.",
                "total_records": inserted_count
            }), 200
        else:
            return jsonify({"message": f"Penyimpanan ke DB Gagal. {db_message}"}), 500

    else:
        return jsonify({"message": "Format file tidak valid. Gunakan CSV atau XLSX."}), 400


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)