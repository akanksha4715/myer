import { useState, useEffect, useCallback } from 'react';
import './App.css';

const TOTAL_SHELVES = 50;

const initialInventory = () => {
  try {
    const saved = localStorage.getItem('shoeInventory');
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
};

export default function App() {
  const [inventory, setInventory] = useState(initialInventory);
  const [activeTab, setActiveTab] = useState('add');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShelf, setSelectedShelf] = useState(null);
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    shoeName: '',
    brand: '',
    size: '',
    gender: '',
    color: '',
    shelf: '',
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    localStorage.setItem('shoeInventory', JSON.stringify(inventory));
  }, [inventory]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleFormChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setFormError('');
  };

  const handleAddShoe = (e) => {
    e.preventDefault();
    const { shoeName, shelf } = form;

    if (!shoeName.trim()) return setFormError('Shoe name is required.');
    if (!shelf) return setFormError('Please enter a shelf number.');

    const shelfNum = parseInt(shelf, 10);
    if (isNaN(shelfNum) || shelfNum < 1 || shelfNum > TOTAL_SHELVES)
      return setFormError(`Shelf must be between 1 and ${TOTAL_SHELVES}.`);

    const newEntry = {
      id: Date.now(),
      shoeName: shoeName.trim(),
      brand: form.brand.trim(),
      size: form.size.trim(),
      gender: form.gender,
      color: form.color.trim(),
      shelf: shelfNum,
      addedAt: new Date().toLocaleDateString('en-AU'),
    };

    setInventory((prev) => [...prev, newEntry]);
    setForm({ shoeName: '', brand: '', size: '', gender: '', color: '', shelf: '' });
    showNotification(`"${newEntry.shoeName}" added to Shelf ${shelfNum}`);
  };

  const handleRemove = (id) => {
    const entry = inventory.find((i) => i.id === id);
    setInventory((prev) => prev.filter((i) => i.id !== id));
    if (entry) showNotification(`"${entry.shoeName}" removed from Shelf ${entry.shelf}`, 'error');
  };

  const searchResults = useCallback(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return inventory.filter(
      (i) =>
        i.shoeName.toLowerCase().includes(q) ||
        i.brand.toLowerCase().includes(q) ||
        i.color.toLowerCase().includes(q)
    );
  }, [searchQuery, inventory]);

  const shelfMap = inventory.reduce((acc, item) => {
    if (!acc[item.shelf]) acc[item.shelf] = [];
    acc[item.shelf].push(item);
    return acc;
  }, {});

  const shelfItems = selectedShelf ? (shelfMap[selectedShelf] || []) : [];

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-content">
          <span className="header-icon">👟</span>
          <div>
            <h1>Myer Shoe Reserve</h1>
            <p>Stockroom Inventory Manager</p>
          </div>
          <div className="header-stats">
            <div className="stat">
              <span className="stat-number">{inventory.length}</span>
              <span className="stat-label">Entries</span>
            </div>
            <div className="stat">
              <span className="stat-number">{Object.keys(shelfMap).length}</span>
              <span className="stat-label">Shelves Used</span>
            </div>
          </div>
        </div>
      </header>

      {notification && (
        <div className={`notification ${notification.type}`}>
          {notification.type === 'success' ? '✅' : '🗑️'} {notification.msg}
        </div>
      )}

      <nav className="tabs">
        {[
          { key: 'add', label: '➕ Add Shoe' },
          { key: 'shelves', label: '🗄️ Browse Shelves' },
          { key: 'search', label: '🔍 Search' },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`tab-btn ${activeTab === tab.key ? 'active' : ''}`}
            onClick={() => { setActiveTab(tab.key); setSelectedShelf(null); }}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="main-content">
        {activeTab === 'add' && (
          <section className="card">
            <h2>Add Shoe to Shelf</h2>
            <form onSubmit={handleAddShoe} className="shoe-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Shoe Name <span className="req">*</span></label>
                  <input
                    type="text"
                    name="shoeName"
                    value={form.shoeName}
                    onChange={handleFormChange}
                    placeholder="e.g. Air Max 90"
                  />
                </div>
                <div className="form-group">
                  <label>Brand</label>
                  <input
                    type="text"
                    name="brand"
                    value={form.brand}
                    onChange={handleFormChange}
                    placeholder="e.g. Nike"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Size (AU)</label>
                  <input
                    type="text"
                    name="size"
                    value={form.size}
                    onChange={handleFormChange}
                    placeholder="e.g. 9 or 6–12"
                  />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select name="gender" value={form.gender} onChange={handleFormChange}>
                    <option value="">— Select —</option>
                    <option value="Men">Men</option>
                    <option value="Women">Women</option>
                    <option value="Kids">Kids</option>
                    <option value="Unisex">Unisex</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Colour</label>
                  <input
                    type="text"
                    name="color"
                    value={form.color}
                    onChange={handleFormChange}
                    placeholder="e.g. Black/White"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group shelf-input-group">
                  <label>Shelf Number <span className="req">*</span> (1–{TOTAL_SHELVES})</label>
                  <input
                    type="number"
                    name="shelf"
                    value={form.shelf}
                    onChange={handleFormChange}
                    min="1"
                    max={TOTAL_SHELVES}
                    placeholder="Enter shelf number"
                  />
                  {form.shelf && shelfMap[parseInt(form.shelf)] && (
                    <span className="shelf-hint">
                      ⚠️ Shelf {form.shelf} already has {shelfMap[parseInt(form.shelf)].length} item(s)
                    </span>
                  )}
                </div>
              </div>

              {formError && <p className="form-error">⚠️ {formError}</p>}

              <button type="submit" className="btn-primary">
                Add to Shelf
              </button>
            </form>

            {inventory.length > 0 && (
              <div className="recent-section">
                <h3>Recently Added</h3>
                <div className="entry-list">
                  {[...inventory].reverse().slice(0, 5).map((item) => (
                    <EntryCard key={item.id} item={item} onRemove={handleRemove} />
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {activeTab === 'shelves' && (
          <section className="card">
            <h2>Browse Shelves</h2>
            <div className="shelf-legend">
              <span className="legend-dot occupied" /> Occupied &nbsp;&nbsp;
              <span className="legend-dot empty" /> Empty
            </div>
            <div className="shelf-grid">
              {Array.from({ length: TOTAL_SHELVES }, (_, i) => i + 1).map((n) => {
                const items = shelfMap[n] || [];
                const occupied = items.length > 0;
                return (
                  <button
                    key={n}
                    className={`shelf-cell ${occupied ? 'occupied' : 'empty'} ${selectedShelf === n ? 'selected' : ''}`}
                    onClick={() => setSelectedShelf(selectedShelf === n ? null : n)}
                    title={occupied ? `Shelf ${n}: ${items.length} item(s)` : `Shelf ${n}: Empty`}
                  >
                    <span className="shelf-number">{n}</span>
                    {occupied && <span className="shelf-count">{items.length}</span>}
                  </button>
                );
              })}
            </div>

            {selectedShelf && (
              <div className="shelf-detail">
                <h3>Shelf {selectedShelf} {shelfItems.length === 0 && '— Empty'}</h3>
                {shelfItems.length > 0 ? (
                  <div className="entry-list">
                    {shelfItems.map((item) => (
                      <EntryCard key={item.id} item={item} onRemove={handleRemove} />
                    ))}
                  </div>
                ) : (
                  <p className="empty-msg">No shoes on this shelf yet.</p>
                )}
              </div>
            )}

            {inventory.length === 0 && (
              <p className="empty-msg">No shoes added yet. Go to "Add Shoe" to get started.</p>
            )}
          </section>
        )}

        {activeTab === 'search' && (
          <section className="card">
            <h2>Search Shoes</h2>
            <div className="search-bar-wrap">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search by shoe name, brand or colour..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
              {searchQuery && (
                <button className="clear-btn" onClick={() => setSearchQuery('')}>✕</button>
              )}
            </div>

            {searchQuery.trim() ? (
              <>
                <p className="result-count">
                  {searchResults().length} result{searchResults().length !== 1 ? 's' : ''} for &ldquo;{searchQuery}&rdquo;
                </p>
                {searchResults().length > 0 ? (
                  <div className="entry-list">
                    {searchResults().map((item) => (
                      <EntryCard key={item.id} item={item} onRemove={handleRemove} highlightQuery={searchQuery} />
                    ))}
                  </div>
                ) : (
                  <div className="no-results">
                    <span>😕</span>
                    <p>No shoes found matching &ldquo;{searchQuery}&rdquo;</p>
                  </div>
                )}
              </>
            ) : (
              <div className="search-placeholder">
                <span>👟</span>
                <p>Start typing to find a shoe and its shelf location</p>
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function highlightText(text, query) {
  if (!query || !text) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function EntryCard({ item, onRemove, highlightQuery }) {
  return (
    <div className="entry-card">
      <div className="entry-shelf-badge">Shelf {item.shelf}</div>
      <div className="entry-info">
        <div className="entry-name">
          {highlightQuery ? highlightText(item.shoeName, highlightQuery) : item.shoeName}
          {item.brand && (
            <span className="entry-brand">
              {' '}· {highlightQuery ? highlightText(item.brand, highlightQuery) : item.brand}
            </span>
          )}
        </div>
        <div className="entry-meta">
          {item.size && <span>Size {item.size}</span>}
          {item.gender && <span>{item.gender}</span>}
          {item.color && <span>{highlightQuery ? highlightText(item.color, highlightQuery) : item.color}</span>}
          {item.addedAt && <span className="entry-date">Added {item.addedAt}</span>}
        </div>
      </div>
      <button className="remove-btn" onClick={() => onRemove(item.id)} title="Remove entry">
        🗑️
      </button>
    </div>
  );
}
