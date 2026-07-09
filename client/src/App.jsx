import React, { useState } from 'react';
import axios from 'axios';
// כתובת שרת ה-FastAPI שלך
// במקום localhost, נשתמש בכתובת ה-IP המפורשת
const API_BASE_URL = 'http://127.0.0.1:8000/api';
function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);
  
  const [detectedIngredients, setDetectedIngredients] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

const processFile = (file) => {
    // ודאי שזה מקבל את האובייקט file עצמו (למשל e.target.files[0])
    setImage(file); 
    setPreview(URL.createObjectURL(file));
    setDetectedIngredients([]);
    setRecipes([]);
    setError('');
  };

  const uploadAndDetect = async () => {
    if (!image) {
      setError('אנא העלה או גרור תמונה תחילה.');
      return;
    }

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    // המפתח חייב להיות 'file' בדיוק כפי שהגדרנו בשרת!
    formData.append('file', image); 

    try {
      const detectResponse = await axios.post(`${API_BASE_URL}/detection/detect`, formData, {
        headers: { 
          'Content-Type': 'multipart/form-data' 
        }
      });
      

      if (detectResponse.data.status === 'success') {
        const ingredients = detectResponse.data.detected_ingredients;
        setDetectedIngredients(ingredients);

        if (ingredients && ingredients.length > 0) {
          fetchRecipes(ingredients);
        } else {
          setError('המודל לא זיהה אף מצרך בתמונה זו. נסה תמונה ברורה יותר.');
          setLoading(false);
        }
      }
    } catch (err) {
      console.error("Full Error Object:", err);
      // מציג את השגיאה המדויקת מהשרת על גבי המסך
      setError(`שגיאת תקשורת: ${err.response?.data?.detail || err.message}`);
      setLoading(false);
    }
  };

  const fetchRecipes = async (ingredientsList) => {
    try {
      const recipesResponse = await axios.post(`${API_BASE_URL}/recipes/recommend`, ingredientsList);
      if (recipesResponse.data.success) {
        setRecipes(recipesResponse.data.recipes);
      } else {
        setError(recipesResponse.data.message || 'לא נמצאו מתכונים מתאימים.');
      }
    } catch (err) {
      console.error(err);
      setError('שגיאה בשליפת המתכונים מהשרת.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container} dir="rtl">
      <header style={styles.header}>
        <h1 style={styles.title}>מערכת חכמה להמלצת מתכונים 🍳 AI</h1>
        <p style={styles.subtitle}>גרור תמונה של המצרכים שבמקרר, והבינה המלאכותית תמצא מתכון!</p>
      </header>

      <main style={styles.main}>
        <div 
          style={{
            ...styles.dropZone,
            backgroundColor: isDragActive ? '#e2e8f0' : '#ffffff',
            borderColor: isDragActive ? '#3b82f6' : '#cbd5e1'
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input type="file" id="file-upload" style={styles.fileInput} onChange={handleFileChange} accept="image/*"/>
          <label htmlFor="file-upload" style={styles.fileLabel}>
            {preview ? (
              <img src={preview} alt="תצוגה מקדימה" style={styles.imagePreview} />
            ) : (
              <div style={styles.uploadPrompt}>
                <span style={{ fontSize: '48px' }}>📸</span>
                <p style={{ fontWeight: 'bold', margin: '10px 0' }}>גרור ושחרר תמונה כאן או לחץ לבחירה</p>
              </div>
            )}
          </label>
        </div>

        {image && (
          <button onClick={uploadAndDetect} disabled={loading} style={{...styles.button, backgroundColor: loading ? '#94a3b8' : '#10b981'}}>
            {loading ? 'מנתח תמונה ומחפש מתכונים...' : 'זהה מצרכים ומצא מתכונים! ✨'}
          </button>
        )}

        {error && <div style={styles.errorCard}>{error}</div>}

        {detectedIngredients.length > 0 && (
          <div style={styles.ingredientsSection}>
            <h3 style={styles.sectionTitle}>מצרכים שזוהו במקרר ({detectedIngredients.length}):</h3>
            <div style={styles.tagsContainer}>
              {detectedIngredients.map((ing, idx) => <span key={idx} style={styles.tag}>{ing}</span>)}
            </div>
          </div>
        )}

        {recipes.length > 0 && (
          <div style={styles.recipesSection}>
            <h3 style={styles.sectionTitle}>המתכונים המומלצים ביותר:</h3>
            <div style={styles.recipesGrid}>
              {recipes.map((recipe) => (
                <div key={recipe.id} style={styles.recipeCard}>
                  {recipe.image && <img src={recipe.image} alt={recipe.title} style={styles.recipeImage} />}
                  <div style={styles.recipeContent}>
                    <div style={styles.recipeHeaderRow}>
                      <h4 style={styles.recipeTitle}>{recipe.title}</h4>
                      <span style={{...styles.matchBadge, backgroundColor: recipe.match_score > 70 ? '#dcfce7' : '#fef9c3', color: recipe.match_score > 70 ? '#15803d' : '#a16207'}}>
                        {recipe.match_score}% התאמה
                      </span>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <p style={styles.ingredientListTitle}>🥦 מצרכים קיימים:</p>
                      <p style={styles.ingredientText}>{recipe.used_ingredients.join(', ')}</p>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <p style={styles.ingredientListTitle}>❌ מצרכים חסרים:</p>
                      <p style={{...styles.ingredientText, color: '#ef4444'}}>{recipe.missed_ingredients.length > 0 ? recipe.missed_ingredients.join(', ') : 'אין חסרים! 😍'}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const styles = {
  container: { fontFamily: 'Segoe UI, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh', padding: '40px 20px' },
  header: { textAlign: 'center', marginBottom: '40px' },
  title: { fontSize: '2.2rem', color: '#0f172a' },
  subtitle: { color: '#64748b' },
  main: { maxWidth: '800px', margin: '0 auto' },
  dropZone: { border: '3px dashed #cbd5e1', borderRadius: '16px', padding: '20px', textAlign: 'center', cursor: 'pointer', minHeight: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#ffffff' },
  fileInput: { display: 'none' },
  fileLabel: { width: '100%', cursor: 'pointer' },
  uploadPrompt: { color: '#475569' },
  imagePreview: { maxWidth: '100%', maxHeight: '280px', borderRadius: '12px' },
  button: { display: 'block', width: '100%', padding: '16px', color: '#ffffff', border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px' },
  errorCard: { backgroundColor: '#fee2e2', color: '#b91c1c', padding: '12px', borderRadius: '8px', marginTop: '15px', textAlign: 'center' },
  ingredientsSection: { marginTop: '30px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px' },
  sectionTitle: { fontSize: '1.2rem', color: '#334155', borderBottom: '2px solid #f1f5f9', paddingBottom: '8px' },
  tagsContainer: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  tag: { backgroundColor: '#e0f2fe', color: '#0369a1', padding: '6px 14px', borderRadius: '20px' },
  recipesSection: { marginTop: '40px' },
  recipesGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
  recipeCard: { backgroundColor: '#ffffff', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', display: 'flex' },
  recipeImage: { width: '150px', objectFit: 'cover' },
  recipeContent: { padding: '20px', flex: 1 },
  recipeHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  recipeTitle: { fontSize: '1.2rem', margin: 0 },
  matchBadge: { padding: '4px 10px', borderRadius: '8px', fontWeight: 'bold', fontSize: '0.85rem' },
  ingredientListTitle: { fontWeight: 'bold', fontSize: '0.9rem', color: '#475569', margin: '4px 0' },
  ingredientText: { fontSize: '0.9rem', margin: 0 }
};

export default App;