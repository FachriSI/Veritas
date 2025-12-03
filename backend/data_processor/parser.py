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

# Tipe data yang diharapkan untuk konversi otomatis
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
            # Perbaikan Final untuk mengatasi error Tokenizing:
            # 1. encoding='latin-1' (Mengatasi byte 0xa0)
            # 2. engine='python' (Mengatasi parsing quote yang tidak konsisten)
            # 3. on_bad_lines='skip' (Mengatasi crash pada baris 311 yang malformed)
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
        # Konversi tipe data numerik (price, review_no)
        for col, dtype in EXPECTED_DTYPES.items():
            df[col] = pd.to_numeric(df[col], errors='coerce').astype(dtype, errors='ignore')

        # Konversi Release_date menjadi format DATE (YYYY-MM-DD)
        df['release_date'] = pd.to_datetime(df['release_date'], errors='coerce').dt.strftime('%Y-%m-%d')
        
        # Hapus baris yang mungkin memiliki nilai null pada kolom kunci (name dan release_date)
        df.dropna(subset=['release_date', 'name'], inplace=True) 
        
    except Exception as e:
        return None, f"Gagal melakukan konversi tipe data otomatis: {e}"
    
    # 5. Konversi DataFrame ke list of dictionaries untuk insert ke DB
    data_to_insert = df.to_dict('records')

    return data_to_insert, "Data berhasil diparsing dan divalidasi."