# data_processor/parser.py

import pandas as pd
from datetime import datetime
import numpy as np

# Mapping nama kolom dari file mentah ke nama kolom di database 
COLUMN_MAPPING = {
    'Name': 'name',
    'Price': 'price',
    'Release_date': 'release_date',
    'Review_no': 'review_no',
    'Review_type': 'review_type',
    'Tags': 'tags',
    'Description': 'description'
}

# Tipe data yang diharapkan untuk konversi otomatis (Hanya digunakan sebagai referensi)
EXPECTED_DTYPES = {
    'price': float,
    'review_no': np.int64,
}

def parse_and_validate_data(file_path, file_extension):
    """
    Membaca, memvalidasi, dan membersihkan data dari file yang diunggah.
    """
    
    # 1. Baca File (Mendukung CSV dan XLSX)
    try:
        if file_extension == '.csv':
            # Menggunakan konfigurasi robust untuk CSV (encoding='latin-1', engine='python', on_bad_lines='skip')
            df = pd.read_csv(file_path, 
                             encoding='latin-1', 
                             sep=',', 
                             engine='python',
                             on_bad_lines='skip' 
                            ) 
        elif file_extension == '.xlsx':
            df = pd.read_excel(file_path)
        else:
            return None, "Format file tidak didukung. Hanya mendukung .csv atau .xlsx."
    except Exception as e:
        return None, f"Gagal membaca file: {e}"

    # 2. Validasi Kolom Wajib
    required_columns = list(COLUMN_MAPPING.keys())
    missing_columns = [col for col in required_columns if col not in df.columns]

    if missing_columns:
        return None, f"Kolom wajib tidak ditemukan: {', '.join(missing_columns)}. Wajib ada: {', '.join(required_columns)}."

    # 3. Rename dan Seleksi Kolom yang Diperlukan
    df = df[required_columns].rename(columns=COLUMN_MAPPING)

    # 4. Validasi dan Konversi Tipe Data
    try:
        # --- PERBAIKAN 1: Membersihkan kolom Review_no (Menghapus koma/teks) ---
        # Menghapus semua karakter non-digit dari string (seperti " 574,097 User Reviews ")
        df['review_no'] = df['review_no'].astype(str).str.replace(r'[^0-9]', '', regex=True)
        df['review_no'] = pd.to_numeric(df['review_no'], errors='coerce')
        # Mengisi NaN (jika review_no benar-benar kosong) dengan 0 dan konversi ke integer
        df['review_no'] = df['review_no'].fillna(0.0).astype(np.int64)

        # --- PERBAIKAN 2: Handle Price (Menghapus '$', koma, dan mengubah "Free to Play" menjadi 0) ---
        # Hapus simbol '$' dan koma (,) agar dapat dikonversi ke numerik
        df['price'] = df['price'].astype(str).str.replace(r'[\$,]', '', regex=True).str.strip()
        
        # Mengubah nilai non-numerik (misalnya 'Free To Play' atau 'Prepurchase') menjadi NaN
        df['price'] = pd.to_numeric(df['price'], errors='coerce') 
        
        # Mengisi nilai NaN dengan 0.00 (Handle Free To Play/Prepurchase)
        df['price'] = df['price'].fillna(0.00)
        df['price'] = df['price'].astype(float)

        # --- PERBAIKAN 3: Batasi panjang Description ---
        # Untuk mencegah error SQL jika Description terlalu panjang.
        df['description'] = df['description'].astype(str).str.slice(0, 5000)

        # Konversi Release_date menjadi format DATE (YYYY-MM-DD)
        df['release_date'] = pd.to_datetime(df['release_date'], errors='coerce').dt.strftime('%Y-%m-%d')
        
        # Hapus baris yang mungkin memiliki nilai null pada kolom kunci utama
        # Kolom yang TIDAK BOLEH NULL: name, price, review_no, review_type, release_date
        required_for_analysis = ['name', 'price', 'review_no', 'review_type', 'release_date']
        df.dropna(subset=required_for_analysis, inplace=True) 
        
    except Exception as e:
        return None, f"Gagal melakukan konversi tipe data otomatis: {e}"
    
    # 5. Konversi DataFrame ke list of dictionaries untuk insert ke DB
    data_to_insert = df.to_dict('records')

    return data_to_insert, "Data berhasil diparsing dan divalidasi."