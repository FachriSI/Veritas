# data_processor/analyzer.py

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix
import traceback # NEW: Untuk menangkap detail error

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

def run_classification(df_clean: pd.DataFrame):
    """
    Melakukan Normalisasi, Encoding Genre, Pelatihan Model Random Forest, dan Evaluasi.
    (Implementasi Fitur #3.b, #3.c, dan #5.c)
    """
    try: # NEW: Wrap seluruh logika ML dalam try-except block
        if df_clean.empty or len(df_clean) < 100: # Memerlukan minimal data untuk split
            return None, "Data terlalu sedikit (minimal 100 baris) untuk pelatihan model."

        # Inisialisasi DataFrame untuk ML
        df_ml = df_clean.copy()
        
        # 1. Feature Engineering & Encoding Genre (One-Hot Encoding)
        
        # Memastikan kolom tags sudah ada dan memprosesnya
        df_ml['tags_list'] = df_ml['tags'].astype(str).str.split(',').apply(lambda x: [t.strip() for t in x if t.strip()])
        
        all_tags = df_ml['tags_list'].explode().str.strip()
        top_10_tags = all_tags.value_counts().head(10).index.tolist()
        
        # Membuat kolom biner (0 atau 1) untuk Top 10 Tags
        for tag in top_10_tags:
            # 1 jika game memiliki tag, 0 jika tidak
            df_ml[tag] = df_ml['tags_list'].apply(lambda x: 1 if tag in x else 0)

        # 2. Normalisasi Data (Min-Max Scaling) - Fitur #3.b
        
        scaler = MinMaxScaler()
        df_ml[['price_normalized', 'review_no_normalized']] = scaler.fit_transform(
            df_ml[['price', 'review_no']]
        )

        # 3. Definisikan Features (X) dan Target (y)
        
        feature_cols = ['price_normalized', 'review_no_normalized'] + top_10_tags
        target_col = 'review_type'
        
        X = df_ml[feature_cols]
        y = df_ml[target_col]
        
        # PENTING: Filter data jika ada nilai NaN (walaupun seharusnya sudah di-clean di parser)
        X = X.fillna(0) 

        # 4. Split Data dan Training Model
        
        # Periksa apakah target memiliki cukup kelas
        if len(y.unique()) < 2:
            return None, f"Hanya ditemukan satu kelas ulasan ({y.unique()[0]}). Klasifikasi memerlukan minimal 2 kelas."

        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        model = RandomForestClassifier(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)
        y_pred = model.predict(X_test)

        # 5. Evaluasi Model (Fitur #5.c)
        
        # Metrik
        accuracy = accuracy_score(y_test, y_pred)
        precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
        recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

        # Confusion Matrix
        cm = confusion_matrix(y_test, y_pred, labels=y.unique())
        cm_df = pd.DataFrame(cm, index=y.unique(), columns=y.unique())

        # Format hasil
        classification_results = {
            "metrics": {
                "Accuracy": round(accuracy, 4),
                "Precision": round(precision, 4),
                "Recall": round(recall, 4),
                "F1_Score": round(f1, 4),
            },
            "confusion_matrix": cm_df.to_dict('split'), # Menggunakan format split untuk transfer JSON
            "feature_importances": dict(zip(X.columns, model.feature_importances_.round(4)))
        }
        
        return classification_results, None
        
    except Exception as e:
        # Menangkap semua error dan mengembalikannya sebagai pesan
        detailed_error = f"ML Error: {str(e)}. Traceback: {traceback.format_exc()}"
        print(detailed_error) # Cetak ke konsol Flask
        return None, "Gagal menjalankan Model Klasifikasi. Data mungkin tidak seimbang atau ada error dalam perhitungan."

# ... calculate_dashboard_stats tetap sama, kecuali penambahan traceback di atas sudah menangani error-nya.
def calculate_dashboard_stats(df: pd.DataFrame):
    """
    Menghitung statistik deskriptif, nilai korelasi Pearson (Fitur #5), dan Klasifikasi ML.
    """
    # 1. Pra-pemrosesan Data (untuk korelasi)
    df['review_score'] = df['review_type'].map(REVIEW_SCORE_MAP)
    # Hapus baris yang mungkin memiliki nilai null pada kolom kunci setelah pemetaan/konversi
    df.dropna(subset=['price', 'review_no', 'review_score'], inplace=True)
    
    total_games = len(df)

    # 2. Statistik Deskriptif 
    min_price = df['price'].min() if not df.empty else 0.00
    max_price = df['price'].max() if not df.empty else 0.00
    avg_review_no = df['review_no'].mean() if not df.empty else 0
    
    descriptive_stats = {
        "total_games": int(total_games),
        "avg_review_no": round(avg_review_no, 2),
        "price_range": f"${min_price:.2f} - ${max_price:.2f}",
        "review_distribution": df['review_type'].value_counts().to_dict() # Distribusi ulasan
    }
    
    # 3. Analisis Korelasi (Pearson) 
    correlation_results = {}
    if total_games > 1: 
        correlation_cols = ['price', 'review_no', 'review_score']
        corr_matrix = df[correlation_cols].corr(method='pearson')
        
        correlation_results = {
            'price_vs_review_score': round(corr_matrix.loc['price', 'review_score'], 4),
            'review_no_vs_review_score': round(corr_matrix.loc['review_no', 'review_score'], 4)
        }
        
    # 4. Analisis Genre (Distribusi dan Rata-rata Skor per Genre) 
    genre_distribution = {}
    genre_avg_score = {}
    
    if total_games > 0:
        genre_df = df.copy()
        genre_df['tags_list'] = genre_df['tags'].astype(str).str.split(',').apply(lambda x: [t.strip() for t in x if t.strip()])
        
        all_tags = genre_df['tags_list'].explode().str.strip()
        genre_counts = all_tags.value_counts().head(10) 
        genre_distribution = genre_counts.to_dict()

        genre_scores = {}
        for tag in genre_counts.index:
            games_with_tag = genre_df[genre_df['tags_list'].apply(lambda x: tag in x)]
            genre_scores[tag] = round(games_with_tag['review_score'].mean(), 4)
            
        genre_avg_score = genre_scores
        
    # 5. Klasifikasi Random Forest (BARU)
    classification_data, ml_error = run_classification(df)

    return {
        "descriptive_stats": descriptive_stats,
        "correlation_results": correlation_results,
        "genre_data": {
            "distribution": genre_distribution, 
            "avg_score": genre_avg_score       
        },
        "classification": classification_data, # NEW
        "ml_error": ml_error # NEW
    }