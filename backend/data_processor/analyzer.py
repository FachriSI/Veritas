# data_processor/analyzer.py

import pandas as pd
import numpy as np

# Mapping Review_type ke skor numerik (diperlukan untuk perhitungan korelasi)
REVIEW_SCORE_MAP = {
    'Overwhelmingly Positive': 5,
    'Very Positive': 4,
    'Positive': 3,
    'Mixed': 2,
    'Mostly Negative': 1,
    'Negative': 1,
    'Very Negative': 1
}

def calculate_dashboard_stats(df: pd.DataFrame):
    """
    Menghitung statistik deskriptif dan nilai korelasi Pearson (Fitur #5).
    """
    
    # 1. Pra-pemrosesan Data
    
    # Konversi Review_type ke skor numerik (variabel target)
    df['review_score'] = df['review_type'].map(REVIEW_SCORE_MAP)
    
    # Hapus baris yang mungkin memiliki nilai null pada kolom kunci setelah pemetaan/konversi
    df.dropna(subset=['price', 'review_no', 'review_score'], inplace=True)

    # 2. Statistik Deskriptif [cite: uploaded:ya.docx]
    
    total_games = len(df)
    
    # Menghitung Price (Harga)
    min_price = df['price'].min() if not df.empty else 0.00
    max_price = df['price'].max() if not df.empty else 0.00
    
    # Menghitung rata-rata ulasan (Review_no)
    avg_review_no = df['review_no'].mean() if not df.empty else 0
    
    descriptive_stats = {
        "total_games": int(total_games),
        "avg_review_no": round(avg_review_no, 2),
        "price_range": f"{min_price:.2f} - {max_price:.2f}",
        "review_distribution": df['review_type'].value_counts().to_dict() # Distribusi ulasan
    }
    
    # 3. Analisis Korelasi (Pearson) [cite: uploaded:ya.docx]
    correlation_results = {}
    
    if total_games > 1: # Korelasi hanya mungkin jika ada lebih dari 1 data
        correlation_cols = ['price', 'review_no', 'review_score']
        
        # Hitung matriks korelasi Pearson
        corr_matrix = df[correlation_cols].corr(method='pearson')
        
        # Ekstrak nilai korelasi terhadap review_score (variabel target)
        correlation_results = {
            # Koefisien Korelasi Price vs Review Score
            'price_vs_review_score': round(corr_matrix.loc['price', 'review_score'], 4),
            # Koefisien Korelasi Review_no vs Review Score
            'review_no_vs_review_score': round(corr_matrix.loc['review_no', 'review_score'], 4)
        }

    # 4. Analisis Genre (Distribusi dan Rata-rata Skor per Genre) [cite: uploaded:ya.docx]

    genre_distribution = {}
    genre_avg_score = {}
    
    if total_games > 0:
        # Proses kolom 'tags' yang berisi genre yang dipisahkan koma
        genre_df = df.copy()
        genre_df['tags_list'] = genre_df['tags'].astype(str).str.split(',').apply(lambda x: [t.strip() for t in x])
        
        all_tags = genre_df['tags_list'].explode().str.strip()
        
        # Distribusi Genre (Ambil 10 genre teratas)
        genre_counts = all_tags.value_counts().head(10) 
        genre_distribution = genre_counts.to_dict()

        # Hitung Rata-rata Skor per Genre
        genre_scores = {}
        # Iterasi melalui 10 genre teratas untuk menghitung skor rata-rata
        for tag in genre_counts.index:
            games_with_tag = genre_df[genre_df['tags_list'].apply(lambda x: tag in x)]
            genre_scores[tag] = round(games_with_tag['review_score'].mean(), 4)
            
        genre_avg_score = genre_scores


    return {
        "descriptive_stats": descriptive_stats,
        "correlation_results": correlation_results,
        "genre_distribution": genre_distribution,
        "genre_avg_score": genre_avg_score
    }