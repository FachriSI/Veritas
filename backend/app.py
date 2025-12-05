# app.py

from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
import os
from werkzeug.utils import secure_filename
from config import Config
from data_processor.parser import parse_and_validate_data 
from data_processor.analyzer import calculate_dashboard_stats 
import pandas as pd
import math 
import csv # Diperlukan untuk Fitur Export CSV

# --- Konfigurasi UPLOAD ---
UPLOAD_FOLDER = 'uploads' 
ALLOWED_EXTENSIONS = {'csv', 'xlsx'}
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
        return conn
    except mysql.connector.Error as err:
        print(f"Error connecting to MySQL: {err}") 
        return None

# --- Fungsi Utility Umum ---

def allowed_file(filename):
    """Validasi format file"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def clean_nan_to_none(value):
    """Mengubah nilai NaN dari Pandas menjadi None yang diterima MySQL (NULL) untuk menghindari Error 1054."""
    if isinstance(value, float) and math.isnan(value):
        return None
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
        
        # 1. Konversi data menjadi list of tuples DENGAN CLEANING (NaN -> None)
        values = [(
            clean_nan_to_none(d.get('name')), 
            clean_nan_to_none(d.get('price')), 
            clean_nan_to_none(d.get('release_date')), 
            clean_nan_to_none(d.get('review_no')), 
            clean_nan_to_none(d.get('review_type')), 
            clean_nan_to_none(d.get('tags')), 
            clean_nan_to_none(d.get('description'))
        ) for d in data]

        # 2. Implementasi Batch Insert (untuk menghindari batasan max_allowed_packet)
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


def fetch_all_game_data(limit=None, offset=None, search=None, genre=None, review_type=None):
    """Mengambil data game dengan filter dan pagination."""
    conn = get_db_connection()
    if not conn:
        return None, "Gagal terhubung ke database."
    
    # Kueri dasar untuk mengambil semua kolom yang diperlukan untuk analisis/tabel
    select_fields = "id, name, price, release_date, review_no, review_type, tags, description"
    base_query = f"FROM games WHERE 1=1"
    params = []
    
    # Fitur Pencarian Game (Fitur #7)
    if search:
        base_query += " AND name LIKE %s"
        params.append(f"%{search}%")

    # Fitur Filter Genre (Fitur #8)
    if genre:
        genres = [g.strip() for g in genre.split(',') if g.strip()]
        for g in genres:
            base_query += f" AND tags LIKE %s" 
            params.append(f"%{g}%")
            
    # Fitur Filter Review Type (Fitur #8)
    if review_type:
        reviews = [r.strip() for r in review_type.split(',') if r.strip()]
        if reviews:
            placeholders = ', '.join(['%s'] * len(reviews))
            base_query += f" AND review_type IN ({placeholders})"
            params.extend(reviews)
            
    # Menghitung total data
    count_query = "SELECT COUNT(id) AS total " + base_query
    
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute(count_query, params)
        total_records = cursor.fetchone()['total']
        
        data_query = f"SELECT {select_fields} " + base_query
        
        if limit is not None and offset is not None:
            # Fitur Pagination (Fitur #6)
            data_query += " ORDER BY id DESC LIMIT %s OFFSET %s"
            params.extend([limit, offset])
        else:
            # Jika tidak ada limit/offset (misalnya untuk Export), ambil semua
            data_query += " ORDER BY id DESC"
        
        cursor.execute(data_query, params)
        data = cursor.fetchall()
        
        df = pd.DataFrame(data)
        
        return df, total_records, None
    except Exception as e:
        return None, 0, f"Gagal mengambil data dari database: {e}"
    finally:
        conn.close()


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


# --- Rute Dashboard Statistik (Fitur #5) ---
@app.route('/api/dashboard-stats', methods=['GET'])
def get_dashboard_stats():
    """
    Mengambil data dari DB, melakukan analisis korelasi dan statistik, dan mengembalikan hasilnya.
    """
    # Mengambil semua data untuk analisis (limit=None, offset=None)
    df, total_records, error = fetch_all_game_data(limit=None, offset=None)
    
    if error:
        return jsonify({"message": error}), 500
        
    if df.empty:
        return jsonify({"message": "Database kosong, unggah dataset terlebih dahulu."}), 200

    try:
        stats = calculate_dashboard_stats(df)
        
        response = {
            "stats": stats['descriptive_stats'],
            "correlation": stats['correlation_results'],
            "genre_data": {
                "distribution": stats['genre_distribution'], 
                "avg_score": stats['genre_avg_score']       
            }
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error during data analysis: {e}")
        return jsonify({"message": f"Gagal melakukan analisis data: {e}"}), 500


# --- Rute Data Tampilan, Pencarian, Filter, dan Pagination (Fitur #6, #7, #8) ---
@app.route('/api/games/data', methods=['GET'])
def get_games_data():
    """
    Endpoint serbaguna untuk mengambil data dengan filter, pencarian, dan pagination.
    """
    
    # Ambil parameter query dari frontend
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int) 
    search_term = request.args.get('search', '', type=str)
    genre_filter = request.args.get('genre', '', type=str) 
    review_filter = request.args.get('review_type', '', type=str) 
    
    offset = (page - 1) * per_page
    
    # Mengambil data dengan batasan limit dan offset
    df, total_records, error = fetch_all_game_data(
        limit=per_page, 
        offset=offset, 
        search=search_term, 
        genre=genre_filter, 
        review_type=review_filter
    )
    
    if error:
        return jsonify({"message": error}), 500
        
    total_pages = math.ceil(total_records / per_page) if total_records else 0
    
    return jsonify({
        "data": df.to_dict('records'), # Mengubah DataFrame ke format list of dicts (JSON)
        "pagination": {
            "total_records": total_records,
            "total_pages": total_pages,
            "current_page": page,
            "per_page": per_page
        }
    }), 200


# --- Rute CRUD Game Tunggal (Fitur #3 & #4) ---

# Fitur #3: Menambahkan Data Game
@app.route('/api/games', methods=['POST'])
def add_game():
    """Endpoint untuk menambahkan satu record data game baru secara manual (Fitur #3)."""
    data = request.get_json()
    
    if not all(k in data for k in ['name', 'price', 'release_date', 'review_no', 'review_type', 'tags', 'description']):
        return jsonify({"message": "Input data game tidak lengkap."}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Gagal terhubung ke database."}), 500
    
    query = """
    INSERT INTO games (name, price, release_date, review_no, review_type, tags, description)
    VALUES (%s, %s, %s, %s, %s, %s, %s)
    """
    
    try:
        cursor = conn.cursor()
        values = (
            data['name'], data['price'], data['release_date'], 
            data['review_no'], data['review_type'], data['tags'], data['description']
        )
        
        cursor.execute(query, values)
        conn.commit()
        game_id = cursor.lastrowid 
        
        return jsonify({"message": "Data game berhasil ditambahkan.", "id": game_id}), 201
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"message": f"Gagal menambahkan data ke database: {err}"}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        conn.close()

# Fitur #4: Mengedit Data Game
@app.route('/api/games/<int:game_id>', methods=['PUT'])
def edit_game(game_id):
    """Endpoint untuk mengubah record data game tertentu (Fitur #4)."""
    data = request.get_json()
    
    if 'name' not in data or 'price' not in data: 
        return jsonify({"message": "Data yang diubah tidak valid."}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Gagal terhubung ke database."}), 500
    
    query = """
    UPDATE games 
    SET name=%s, price=%s, release_date=%s, review_no=%s, 
        review_type=%s, tags=%s, description=%s
    WHERE id=%s
    """
    
    try:
        cursor = conn.cursor()
        values = (
            data['name'], data['price'], data['release_date'], 
            data['review_no'], data['review_type'], data['tags'], data['description'],
            game_id
        )
        
        cursor.execute(query, values)
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"message": "Game tidak ditemukan atau tidak ada perubahan."}), 404
        
        return jsonify({"message": f"Data game ID {game_id} berhasil diubah."}), 200
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"message": f"Gagal mengubah data di database: {err}"}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        conn.close()

# Fitur #4: Menghapus Data Game
@app.route('/api/games/<int:game_id>', methods=['DELETE'])
def delete_game(game_id):
    """Endpoint untuk menghapus record data game tertentu (Fitur #4)."""
    
    conn = get_db_connection()
    if not conn:
        return jsonify({"message": "Gagal terhubung ke database."}), 500
    
    query = "DELETE FROM games WHERE id = %s"
    
    try:
        cursor = conn.cursor()
        cursor.execute(query, (game_id,))
        conn.commit()
        
        if cursor.rowcount == 0:
            return jsonify({"message": "Game tidak ditemukan."}), 404
            
        return jsonify({"message": f"Data game ID {game_id} berhasil dihapus."}), 200
        
    except mysql.connector.Error as err:
        conn.rollback()
        return jsonify({"message": f"Gagal menghapus data dari database: {err}"}), 500
    finally:
        if 'cursor' in locals():
            cursor.close()
        conn.close()


if __name__ == '__main__':
    # Server Flask berjalan di host:port 0.0.0.0:5000
    app.run(debug=True, host='0.0.0.0', port=5000)