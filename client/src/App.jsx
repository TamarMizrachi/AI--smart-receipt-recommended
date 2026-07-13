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


 // חדשששש
  const [selectedRecipe, setSelectedRecipe] = useState(null); // מתכון שנבחר לפרטים
  const [recipeLoading, setRecipeLoading] = useState(false); // לטעינת פרטי המתכון



  // מתחיל חדש 
  const fetchRecipeDetails = async (recipeId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/recipes/${recipeId}/details`);
      if (response.data.success) {
        setSelectedRecipe(response.data.recipe);
      } else {
        setError('לא הצלחנו לשלוף את פרטי המתכון.');
      }
    } catch (err) {
      console.error("שגיאה בשליפת פרטי מתכון:", err);
      setError('שגיאה בתקשורת עם השרת.');
    } finally {
      setLoading(false);
    }
  };
  // נגמר חדש


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
        <div style={styles.badgeTop}>
          AI Fresh Produce Scan
        </div>
        <h1 style={styles.title}>AI לזיהוי פירות וירקות</h1>
        <p style={styles.subtitle}>
          העלו תמונה של הפירות והירקות שלכם,
          ותנו לבינה המלאכותית לזהות אותם ולהמליץ על מתכונים שמתאימים בדיוק למה שיש אצלכם בבית.        </p>
      </header>


      <main style={styles.main}>

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
                <div style={styles.iconsRow}>📸</div>
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
              backgroundColor: loading ? '#94a3b8' : '#2E2E2E',
              boxShadow: loading ? 'none' : '0 4px 12px rgba(46, 46, 46, 0.15)'
            }}
          >
            {loading ? ' סורק ומזהה פירות וירקות בתמונה...' : ' פענח פירות וירקות בתמונה!'}
          </button>
        )}

        {error && <div style={styles.errorCard}>⚠️ {error}</div>}

        {/* שלב הביניים החכם: אישור מצרכים לפני מתכונים */}
        {(detectedData.sure.length > 0 || detectedData.unsure.length > 0 || customAddedItems.length > 0) && (
          <div style={styles.approvalSection}>
            <div style={styles.sectionHeader}>
              <h3 style={styles.sectionTitle}> אישור פירות וירקות שזוהו</h3>
              <p style={styles.sectionSubtitle}>לחצו על פריט כדי להוסיף או להסיר אותו מסל ההכנה שלכם:</p>
            </div>

            {/* פריטים בוודאות גבוהה */}
            {detectedData.sure.length > 0 && (
              <div style={styles.categoryBlock}>
                <p style={styles.categoryTitle}> זוהו בוודאות גבוהה:</p>
                <div style={styles.tagsContainer}>
                  {detectedData.sure.map((item, idx) => {
                    const isSelected = confirmedItems.includes(item);
                    return (
                      <span
                        key={idx}
                        onClick={() => toggleItem(item)}
                        style={{
                          ...styles.tag,
                          backgroundColor: isSelected ? styles.tagSelected.backgroundColor : styles.tagUnselected.backgroundColor,
                          color: isSelected ? styles.tagSelected.color : styles.tagUnselected.color,
                          borderColor: isSelected ? styles.tagSelected.borderColor : styles.tagUnselected.borderColor
                        }}
                      >
                        {item}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* פריטים בספק */}
            {detectedData.unsure.length > 0 && (
              <div style={styles.categoryBlock}>
                <p style={styles.categoryTitle}> זוהו בספק (ודאו אם אכן קיימים אצלכם):</p>
                <div style={styles.tagsContainer}>
                  {detectedData.unsure.map((item, idx) => {
                    const isSelected = confirmedItems.includes(item);
                    return (
                      <span
                        key={idx}
                        onClick={() => toggleItem(item)}
                        style={{
                          ...styles.tag,
                          backgroundColor: isSelected ? styles.tagSelected.backgroundColor : styles.tagUnselected.backgroundColor,
                          color: isSelected ? styles.tagSelected.color : styles.tagUnselected.color,
                          borderColor: isSelected ? styles.tagSelected.borderColor : styles.tagUnselected.borderColor,
                          borderStyle: isSelected ? 'solid' : 'dashed'
                        }}
                      >
                        {item}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* פריטים שהוספו ידנית */}
            {customAddedItems.length > 0 && (
              <div style={styles.categoryBlock}>
                <p style={styles.categoryTitle}> הוספתם ידנית:</p>
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
                backgroundColor: loading || confirmedItems.length === 0 ? '#94a3b8' : '#2E2E2E',
                boxShadow: loading || confirmedItems.length === 0 ? 'none' : '0 4px 12px rgba(46, 46, 46, 0.15)'
              }}
            >
              {loading ? ' מרכיב לכם מנות נהדרות...' : ` מצא לי מתכונים עם הירקות והפירות שאשרתי (${confirmedItems.length})`}
            </button>
          </div>
        )}

        {/* הצגת כרטיסיות המתכונים */}
        {recipes.length > 0 && (
          <div style={styles.recipesSection}>
            <h3 style={styles.recipesMainTitle}>✨ המתכונים המומלצים ביותר עבורכם:</h3>
            <div style={styles.recipesGrid}>
              {recipes.map((recipe) => (
                
                <div
                  key={recipe.id}
                  style={{ ...styles.recipeCard, cursor: 'pointer' }}
                  onClick={() => fetchRecipeDetails(recipe.id)}
                >
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

                // נגמר חדשש
              ))}
            </div>
          </div>
        )}
      </main>


      {/* מתחיל חדש */}
    
    
    
    {selectedRecipe && (
        <div style={styles.modalOverlay} onClick={() => setSelectedRecipe(null)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button style={styles.closeButton} onClick={() => setSelectedRecipe(null)}>✖ סגור</button>
            
            <h2 style={{marginTop: 0}}>{selectedRecipe.title}</h2>
            {selectedRecipe.image && <img src={selectedRecipe.image} alt={selectedRecipe.title} style={{width: '100%', borderRadius: '12px'}} />}
            
            <p><strong>⏱️ זמן הכנה:</strong> {selectedRecipe.readyInMinutes ? `${selectedRecipe.readyInMinutes} דקות` : 'לא צוין'}</p>
            
            <h3>👨‍🍳 הוראות הכנה:</h3>
            <div dangerouslySetInnerHTML={{ __html: selectedRecipe.instructions || 'אין הוראות זמינות למתכון זה.' }} />
          </div>
        </div>
      )}
      {/* נגמר חדש */}
    
    
    </div>
  );
}
const styles = {
  container: {
    fontFamily: "'Assistant', 'Varela Round', sans-serif",
    backgroundColor: '#fff5f2',
    minHeight: '100vh',
    padding: '50px 20px',
    color: '#2E2E2E',
    width: '100vw',
    position: 'absolute',
    top: 0,
    right: 0,
    boxSizing: 'border-box'
  },
  header: {
    textAlign: 'center',
    marginBottom: '50px' /* הגדלת הריווח מתחת לכל הבלוק העליון */
  },
  badgeTop: {
    display: 'inline-block',
    backgroundColor: '#F6E8E4',
    color: '#A47C6E',
    padding: '8px 22px',
    borderRadius: '30px',
    fontSize: '0.85rem',
    fontWeight: '600',
    marginBottom: '20px',
    border: '1px solid #EEDBD6'
  },
  title: {
    fontSize: '2.8rem',
    color: '#3E3935',
    fontWeight: '800',
    margin: '0 0 25px 0', /* הגדלת הריווח המדויק בין הכותרת למלל שמתחתיה */
    letterSpacing: '-0.5px'
  },
  subtitle: {
    color: '#5c5c5c',
    fontSize: '1.15rem',
    maxWidth: '620px',
    margin: '0 auto',
    lineHeight: '1.7',
    fontWeight: '400'
  },
  main: {
    maxWidth: '760px',
    margin: '0 auto'
  },
  tipCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: '#fdfdfd',
    border: '1px solid #EEDBD6',
    padding: '16px 22px',
    borderRadius: '12px',
    marginBottom: '35px',
    color: '#3E3935',
    fontSize: '0.95rem',
    boxShadow: '0 4px 12px rgba(238, 219, 214, 0.25)'
  },
  dropZone: {
    border: '2px dashed #c2a8a1',
    borderRadius: '14px',
    padding: '50px 20px',
    textAlign: 'center',
    cursor: 'pointer',
    minHeight: '240px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
    backgroundColor: '#fdfdfd',
    boxShadow: '0 6px 20px rgba(238, 219, 214, 0.15)'
  },
  fileInput: { display: 'none' },
  fileLabel: { width: '100%', cursor: 'pointer' },
  previewContainer: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '320px',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.06)'
  },
  changeImageText: {
    fontSize: '0.85rem',
    color: '#A47C6E',
    marginTop: '12px',
    fontWeight: '600'
  },
  uploadPrompt: { color: '#2E2E2E' },
  iconsRow: { fontSize: '42px', marginBottom: '16px', letterSpacing: '10px' },
  uploadMainText: { fontWeight: '700', fontSize: '1.2rem', color: '#3E3935', margin: '6px 0' },
  uploadSubText: { fontSize: '0.95rem', color: '#5c5c5c', margin: 0 },
  button: {
    display: 'block',
    width: '100%',
    padding: '16px',
    color: '#ffffff',
    backgroundColor: '#A47C6E',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '24px',
    transition: 'all 0.2s ease',
    boxShadow: '0 4px 14px rgba(164, 124, 110, 0.3)'
  },
  errorCard: {
    backgroundColor: '#fff1f1',
    border: '1px solid #fecaca',
    color: '#dc2626',
    padding: '16px',
    borderRadius: '12px',
    marginTop: '24px',
    textAlign: 'center'
  },
  approvalSection: {
    marginTop: '45px',
    backgroundColor: '#fdfdfd',
    padding: '35px',
    borderRadius: '16px',
    boxShadow: '0 10px 30px rgba(238, 219, 214, 0.25)',
    border: '1px solid #EEDBD6'
  },
  sectionHeader: {
    borderBottom: '1px solid #F6E8E4',
    paddingBottom: '18px',
    marginBottom: '24px'
  },
  sectionTitle: { fontSize: '1.45rem', color: '#3E3935', fontWeight: '800', margin: '0 0 6px 0' },
  sectionSubtitle: { fontSize: '0.95rem', color: '#5c5c5c', margin: 0 },
  categoryBlock: { marginTop: '20px', marginBottom: '26px' },
  categoryTitle: { fontWeight: '700', color: '#2E2E2E', fontSize: '0.95rem', marginBottom: '12px' },
  tagsContainer: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  tag: {
    padding: '10px 24px',
    borderRadius: '12px', /* שינוי לפינות המעוגלות האחידות שלכן */
    cursor: 'pointer',
    border: '1px solid',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'all 0.2s ease',
    userSelect: 'none',
    display: 'inline-flex',
    alignItems: 'center'
  },
  tagSelected: {
    backgroundColor: '#A47C6E',
    color: '#ffffff',
    borderColor: '#A47C6E'
  },
  tagUnselected: {
    backgroundColor: '#F6E8E4',
    color: '#3E3935',
    borderColor: '#EEDBD6'
  },
  customAddForm: {
    display: 'flex',
    gap: '12px',
    marginTop: '30px',
    padding: '24px 0 0 0',
    borderTop: '1px dashed #EEDBD6'
  },
  customInput: {
    flex: 1,
    padding: '14px 18px',
    borderRadius: '12px',
    border: '1px solid #EEDBD6',
    fontSize: '0.95rem',
    outline: 'none',
    backgroundColor: '#fff5f2',
    color: '#2E2E2E'
  },
  addBtn: {
    backgroundColor: '#A47C6E',
    color: '#ffffff',
    border: 'none',
    padding: '14px 24px',
    borderRadius: '12px',
    fontWeight: 'bold',
    cursor: 'pointer'
  },
  searchRecipesBtn: {
    display: 'block',
    width: '100%',
    padding: '16px',
    color: '#ffffff',
    backgroundColor: '#A47C6E',
    border: 'none',
    borderRadius: '12px',
    fontSize: '1.1rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    marginTop: '30px',
    boxShadow: '0 4px 14px rgba(164, 124, 110, 0.3)'
  },
  recipesSection: { marginTop: '50px' },
  recipesMainTitle: { fontSize: '1.6rem', fontWeight: '800', color: '#3E3935', marginBottom: '24px' },
  recipesGrid: { display: 'flex', flexDirection: 'column', gap: '24px' },
  recipeCard: {
    backgroundColor: '#fdfdfd',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 10px 30px rgba(238, 219, 214, 0.15)',
    display: 'flex',
    border: '1px solid #EEDBD6'
  },
  recipeImage: { width: '200px', objectFit: 'cover' },
  recipeContent: { padding: '28px', flex: 1 },
  recipeHeaderRow: { display: 'flex', justifycontent: 'space-between', alignItems: 'center' },
  recipeTitle: { fontSize: '1.4rem', fontWeight: '800', color: '#3E3935', margin: 0 },
  matchBadge: {
    padding: '6px 14px',
    borderRadius: '30px',
    fontWeight: 'bold',
    fontSize: '0.85rem',
    backgroundColor: '#F6E8E4',
    color: '#A47C6E',
    border: '1px solid #EEDBD6'
  },
  ingredientListTitle: { fontWeight: '700', fontSize: '0.9rem', color: '#5c5c5c', margin: '6px 0' },
  ingredientText: { fontSize: '0.95rem', margin: 0, lineHeight: '1.6', color: '#2E2E2E' },
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '24px', maxWidth: '600px', width: '100%', maxHeight: '80vh', overflowY: 'auto', position: 'relative' },
  closeButton: { position: 'absolute', top: '15px', right: '15px', background: '#ef4444', color: '#fff', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }

};

export default App;