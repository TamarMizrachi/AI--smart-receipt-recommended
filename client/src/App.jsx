import React, { useState } from 'react';
import axios from 'axios';

// כתובת שרת ה-FastAPI שלך
const API_BASE_URL = 'http://127.0.0.1:8000/api';

function App() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragActive, setIsDragActive] = useState(false);

  // ניהול המצרכים לפי רמות ביטחון
  const [detectedData, setDetectedData] = useState({ sure: [], unsure: [] });
  const [confirmedItems, setConfirmedItems] = useState([]); // הרשימה הסופית שהמשתמש מאשר
  const [customItem, setCustomItem] = useState(''); // שדה הוספה ידנית

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
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setDetectedData({ sure: [], unsure: [] });
    setConfirmedItems([]);
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
    formData.append('file', image);

    try {
      const detectResponse = await axios.post(`${API_BASE_URL}/detection/detect`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (detectResponse.data.status === 'success') {
        // תמיכה גם במבנה החדש (sure/unsure) וגם בישן למניעת באגים
        const sureList = detectResponse.data.sure || detectResponse.data.detected_ingredients || [];
        const unsureList = detectResponse.data.unsure || [];

        setDetectedData({ sure: sureList, unsure: unsureList });

        // מוסיפים לרשימה המאושרת אוטומטית אך ורק את הפריטים שהמודל בטוח בהם!
        setConfirmedItems([...sureList]);

        if (sureList.length === 0 && unsureList.length === 0) {
          setError('לא זוהו פירות או ירקות בתמונה. אנא ודאו שהפריטים פרוסים בבירור וצלמו שוב.');
        }

      }
    } catch (err) {
      console.error("Full Error Object:", err);
      setError(`שגיאת תקשורת: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // הוספה או הסרה בלחיצה על תגית
  const toggleItem = (itemName) => {
    if (confirmedItems.includes(itemName)) {
      setConfirmedItems(confirmedItems.filter(i => i !== itemName));
    } else {
      setConfirmedItems([...confirmedItems, itemName]);
    }
  };

  // הוספת מצרך ידני מהשדה התחתון
  const handleAddCustomItem = (e) => {
    e.preventDefault();
    const cleanItem = customItem.trim();
    if (cleanItem && !confirmedItems.includes(cleanItem)) {
      setConfirmedItems([...confirmedItems, cleanItem]);
      setCustomItem('');
    }
  };

  // שליפת מתכונים אך ורק לפי הרשימה שהמשתמש אישר סופית
  const fetchRecipes = async () => {
    if (confirmedItems.length === 0) {
      setError('אנא אשר או הוסף לפחות מצרך אחד לפני החיפוש.');
      return;
    }

    setLoading(true);
    setError('');
    setRecipes([]);

    try {
      const recipesResponse = await axios.post(`${API_BASE_URL}/recipes/recommend`, confirmedItems);
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

  // בדיקה האם יש מצרכים שהוספו ידנית (שלא הגיעו מה-AI) כדי להציג אותם גם
  const customAddedItems = confirmedItems.filter(
    item => !detectedData.sure.includes(item) && !detectedData.unsure.includes(item)
  );

  return (
    <div style={styles.container} dir="rtl">
      <header style={styles.header}>
        <div style={styles.badgeTop}>🥦 AI Fresh Produce Scan 🍎</div>
        <h1 style={styles.title}>השף החכם לפירות וירקות</h1>
        <p style={styles.subtitle}>
          צלמו או גררו תמונה של הירקות והפירות שיש לכם במקרר או על השיש, והבינה המלאכותית תרכיב לכם מתכונים בריאים וטעימים בשניות!
        </p>
      </header>

      {/* כרטיס הדרכה לצילום נכון */}
      <div style={styles.tipsContainer}>
        <h4 style={styles.tipsTitle}>📸 איך להוציא את המקסימום מה-AI?</h4>
        <ul style={styles.tipsList}>
          <li>פרסו את הפירות והירקות על המשטח (לא הכל דחוס בשקית).</li>
          <li>וודאו שיש מספיק אור – המצלמה אוהבת ירקות מוארים!</li>
          <li>צלמו מלמעלה כדי שנוכל לראות את כולם בבת אחת.</li>
        </ul>
      </div>


      <main style={styles.main}>
        {/* כרטיסיית הדרכה ויזואלית לדיוק מירבי */}
        <div style={styles.tipCard}>
          <span style={{ fontSize: '20px' }}>💡</span>
          <span><strong>טיפ לדיוק מירבי:</strong> מומלץ לצלם את הפירות והירקות כשהם גלויים ופרוסים בצורה ברורה על גבי משטח או מדף, ללא שקיות או אריזות אטומות.</span>
        </div>

        {/* אזור העלאת התמונה */}
        <div
          style={{
            ...styles.dropZone,
            backgroundColor: isDragActive ? '#f0fdf4' : '#ffffff',
            borderColor: isDragActive ? '#10b981' : '#cbd5e1',
            boxShadow: isDragActive ? '0 10px 25px -5px rgba(16, 185, 129, 0.15)' : '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
        >
          <input type="file" id="file-upload" style={styles.fileInput} onChange={handleFileChange} accept="image/*" />
          <label htmlFor="file-upload" style={styles.fileLabel}>
            {preview ? (
              <div style={styles.previewContainer}>
                <img src={preview} alt="תצוגה מקדימה" style={styles.imagePreview} />
                <p style={styles.changeImageText}>👆 לחץ שוב להחלפת תמונה</p>
              </div>
            ) : (
              <div style={styles.uploadPrompt}>
                <div style={styles.iconsRow}>🥑 🍅 🥒 🥕 🍏</div>
                <p style={styles.uploadMainText}>גרור ושחרר תמונה של פירות וירקות כאן</p>
                <p style={styles.uploadSubText}>או לחץ לבחירת תמונה מתוך המכשיר</p>
              </div>
            )}
          </label>
        </div>

        {image && (
          <button
            onClick={uploadAndDetect}
            disabled={loading}
            style={{
              ...styles.button,
              backgroundColor: loading ? '#94a3b8' : '#059669',
              boxShadow: loading ? 'none' : '0 10px 15px -3px rgba(5, 150, 105, 0.25)'
            }}
          >
            {loading ? '🥑 סורק ומזהה פירות וירקות בתמונה...' : '✨ פענח פירות וירקות בתמונה!'}
          </button>
        )}

        {error && <div style={styles.errorCard}>⚠️ {error}</div>}

        {/* שלב הביניים החכם: אישור מצרכים לפני מתכונים */}
        {(detectedData.sure.length > 0 || detectedData.unsure.length > 0 || customAddedItems.length > 0) && (
          <div style={styles.approvalSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}>🧑‍🍳 אישור פירות וירקות שזוהו</h3>
              <p style={styles.sectionSubtitle}>לחצו על פריט כדי להוסיף או להסיר אותו מסל ההכנה שלכם:</p>
            </div>

            {/* פריטים בוודאות גבוהה */}
            {detectedData.sure.length > 0 && (
              <div style={styles.categoryBlock}>
                <p style={styles.categoryTitle}>🟢 זוהו בוודאות גבוהה:</p>
                <div style={styles.tagsContainer}>
                  {detectedData.sure.map((item, idx) => {
                    const isSelected = confirmedItems.includes(item);
                    return (
                      <span
                        key={idx}
                        onClick={() => toggleItem(item)}
                        style={{
                          ...styles.tag,
                          backgroundColor: isSelected ? '#dcfce7' : '#f8fafc',
                          color: isSelected ? '#166534' : '#64748b',
                          borderColor: isSelected ? '#22c55e' : '#e2e8f0'
                        }}
                      >
                        {isSelected ? '✅ ' : '❌ '} {item}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* פריטים בספק */}
            {detectedData.unsure.length > 0 && (
              <div style={styles.categoryBlock}>
                <p style={styles.categoryTitle}>🟡 זוהו בספק (ודאו אם אכן קיימים אצלכם):</p>
                <div style={styles.tagsContainer}>
                  {detectedData.unsure.map((item, idx) => {
                    const isSelected = confirmedItems.includes(item);
                    return (
                      <span
                        key={idx}
                        onClick={() => toggleItem(item)}
                        style={{
                          ...styles.tag,
                          backgroundColor: isSelected ? '#fef9c3' : '#f8fafc',
                          color: isSelected ? '#854d0e' : '#64748b',
                          borderColor: isSelected ? '#eab308' : '#e2e8f0'
                        }}
                      >
                        {isSelected ? '✅ ' : '❓ '} {item}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* פריטים שהוספו ידנית */}
            {customAddedItems.length > 0 && (
              <div style={styles.categoryBlock}>
                <p style={styles.categoryTitle}>🔵 הוספתם ידנית:</p>
                <div style={styles.tagsContainer}>
                  {customAddedItems.map((item, idx) => (
                    <span
                      key={idx}
                      onClick={() => toggleItem(item)}
                      style={{
                        ...styles.tag,
                        backgroundColor: '#e0f2fe',
                        color: '#0369a1',
                        borderColor: '#38bdf8'
                      }}
                    >
                      ✅ {item} (הסר)
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* טופס הוספה ידנית מהירה */}
            <form onSubmit={handleAddCustomItem} style={styles.customAddForm}>
              <input
                type="text"
                placeholder="חסר פרי או ירק לרשימה? הוסיפו אותו כאן..."
                value={customItem}
                onChange={(e) => setCustomItem(e.target.value)}
                style={styles.customInput}
              />
              <button type="submit" style={styles.addBtn}>+ הוסף לפריטים</button>
            </form>

            <button
              onClick={fetchRecipes}
              disabled={loading || confirmedItems.length === 0}
              style={{
                ...styles.searchRecipesBtn,
                backgroundColor: loading || confirmedItems.length === 0 ? '#94a3b8' : '#10b981',
                boxShadow: loading || confirmedItems.length === 0 ? 'none' : '0 10px 15px -3px rgba(16, 185, 129, 0.3)'
              }}
            >
              {loading ? '🔍 מרכיב לכם מנות נהדרות...' : `🥗 מצא לי מתכונים עם הירקות והפירות שאשרתי (${confirmedItems.length})`}
            </button>
          </div>
        )}

        {/* הצגת כרטיסיות המתכונים */}
        {recipes.length > 0 && (
          <div style={styles.recipesSection}>
            <h3 style={styles.recipesMainTitle}>✨ המתכונים המומלצים ביותר עבורכם:</h3>
            <div style={styles.recipesGrid}>
              {recipes.map((recipe) => (
                <div key={recipe.id} style={styles.recipeCard}>
                  {recipe.image && <img src={recipe.image} alt={recipe.title} style={styles.recipeImage} />}
                  <div style={styles.recipeContent}>
                    <div style={styles.recipeHeaderRow}>
                      <h4 style={styles.recipeTitle}>{recipe.title}</h4>
                      <span style={{ ...styles.matchBadge, backgroundColor: recipe.match_score > 70 ? '#dcfce7' : '#fef9c3', color: recipe.match_score > 70 ? '#15803d' : '#a16207' }}>
                        {recipe.match_score}% התאמה
                      </span>
                    </div>
                    <div style={{ marginTop: '14px' }}>
                      <p style={styles.ingredientListTitle}>🥗 פירות וירקות קיימים:</p>
                      <p style={styles.ingredientText}>{recipe.used_ingredients.join(', ')}</p>
                    </div>
                    <div style={{ marginTop: '10px' }}>
                      <p style={styles.ingredientListTitle}>🛒 מצרכים להשלמה:</p>
                      <p style={{ ...styles.ingredientText, color: recipe.missed_ingredients.length > 0 ? '#ef4444' : '#10b981', fontWeight: recipe.missed_ingredients.length > 0 ? 'normal' : 'bold' }}>
                        {recipe.missed_ingredients.length > 0 ? recipe.missed_ingredients.join(', ') : 'יש לכם את כל המצרכים! 😍'}
                      </p>
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
  container: { fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', backgroundColor: '#f0fdf4', minHeight: '100vh', padding: '40px 20px', color: '#1e293b' },
  header: { textAlign: 'center', marginBottom: '35px' },
  tipsContainer: {
    backgroundColor: '#fef3c7',
    border: '1px solid #fde68a',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '20px',
    color: '#92400e'
  },
  tipsTitle: { margin: '0 0 8px 0', fontSize: '1.1rem' },
  tipsList: { margin: 0, paddingRight: '20px', fontSize: '0.95rem' },
  badgeTop: { display: 'inline-block', backgroundColor: '#dcfce7', color: '#166534', padding: '6px 16px', borderRadius: '50px', fontSize: '0.85rem', fontWeight: 'bold', letterSpacing: '0.5px', marginBottom: '12px', border: '1px solid #bbf7d0' },
  title: { fontSize: '2.5rem', color: '#065f46', fontWeight: '800', margin: '0 0 12px 0' },
  subtitle: { color: '#475569', fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' },
  main: { maxWidth: '820px', margin: '0 auto' },
  tipCard: { display: 'flex', alignItems: 'center', gap: '12px', backgroundColor: '#ffffff', border: '1px solid #bbf7d0', padding: '14px 20px', borderRadius: '14px', marginBottom: '24px', color: '#166534', fontSize: '0.95rem', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' },
  dropZone: { border: '2px dashed #cbd5e1', borderRadius: '20px', padding: '35px 20px', textAlign: 'center', cursor: 'pointer', minHeight: '230px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s ease' },
  fileInput: { display: 'none' },
  fileLabel: { width: '100%', cursor: 'pointer' },
  previewContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  imagePreview: { maxWidth: '100%', maxHeight: '300px', borderRadius: '14px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' },
  changeImageText: { fontSize: '0.85rem', color: '#64748b', marginTop: '10px', fontWeight: '500' },
  uploadPrompt: { color: '#475569' },
  iconsRow: { fontSize: '38px', marginBottom: '12px', letterSpacing: '8px' },
  uploadMainText: { fontWeight: '700', fontSize: '1.15rem', color: '#1e293b', margin: '5px 0' },
  uploadSubText: { fontSize: '0.95rem', color: '#64748b', margin: 0 },
  button: { display: 'block', width: '100%', padding: '18px', color: '#ffffff', border: 'none', borderRadius: '16px', fontSize: '1.15rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '20px', transition: 'all 0.2s ease' },
  errorCard: { backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '16px', borderRadius: '14px', marginTop: '20px', textAlign: 'center', fontWeight: '500' },
  approvalSection: { marginTop: '35px', backgroundColor: '#ffffff', padding: '30px', borderRadius: '24px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.05), 0 8px 10px -6px rgba(0,0,0,0.01)', border: '1px solid #f1f5f9' },
  sectionHeader: { borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' },
  sectionTitle: { fontSize: '1.4rem', color: '#0f172a', fontWeight: '800', margin: '0 0 6px 0' },
  sectionSubtitle: { fontSize: '0.95rem', color: '#64748b', margin: 0 },
  categoryBlock: { marginTop: '18px', marginBottom: '22px' },
  categoryTitle: { fontWeight: '700', color: '#334155', fontSize: '0.95rem', marginBottom: '10px' },
  tagsContainer: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  tag: { padding: '8px 18px', borderRadius: '50px', cursor: 'pointer', border: '1px solid', fontWeight: '600', fontSize: '0.95rem', transition: 'all 0.2s', userSelect: 'none', display: 'inline-flex', alignItems: 'center' },
  customAddForm: { display: 'flex', gap: '12px', marginTop: '25px', paddingTop: '20px', borderTop: '1px dashed #e2e8f0' },
  customInput: { flex: 1, padding: '12px 16px', borderRadius: '12px', border: '1px solid #cbd5e1', fontSize: '0.95rem', outline: 'none' },
  addBtn: { backgroundColor: '#334155', color: '#ffffff', border: 'none', padding: '12px 22px', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer', transition: 'background 0.2s' },
  searchRecipesBtn: { display: 'block', width: '100%', padding: '18px', color: '#ffffff', border: 'none', borderRadius: '16px', fontSize: '1.15rem', fontWeight: 'bold', cursor: 'pointer', marginTop: '25px', transition: 'all 0.2s ease' },
  recipesSection: { marginTop: '45px' },
  recipesMainTitle: { fontSize: '1.5rem', fontWeight: '800', color: '#065f46', marginBottom: '20px' },
  recipesGrid: { display: 'flex', flexDirection: 'column', gap: '20px' },
  recipeCard: { backgroundColor: '#ffffff', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05), 0 4px 6px -4px rgba(0,0,0,0.02)', display: 'flex', border: '1px solid #f1f5f9' },
  recipeImage: { width: '180px', objectFit: 'cover' },
  recipeContent: { padding: '24px', flex: 1 },
  recipeHeaderRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  recipeTitle: { fontSize: '1.3rem', fontWeight: '800', color: '#0f172a', margin: 0 },
  matchBadge: { padding: '6px 12px', borderRadius: '50px', fontWeight: 'bold', fontSize: '0.85rem' },
  ingredientListTitle: { fontWeight: '700', fontSize: '0.9rem', color: '#475569', margin: '4px 0' },
  ingredientText: { fontSize: '0.95rem', margin: 0, lineHeight: '1.5' }
};

export default App;