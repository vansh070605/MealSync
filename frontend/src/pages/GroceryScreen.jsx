import React, { useState, useEffect } from "react";
import { useStore } from "../store";
import { useAuth } from "../context/AuthContext";
import TopBar from "../components/TopBar";
import { getGroceryList, addGroceryItem, updateGroceryItem, deleteGroceryItem, clearGroceryList } from "../api";

// Popular Indian grocery items suggestions for fast adding
const SUGGESTED_ITEMS = [
  "Aloo (Potato)", "Pyaz (Onion)", "Tamatar (Tomato)", "Paneer", 
  "Dahi (Curd)", "Doodh (Milk)", "Atta (Wheat)", "Chawal (Rice)",
  "Dal Tadka Mix", "Adrak (Ginger)", "Lasun (Garlic)", "Hari Mirch",
  "Ghee", "Mustard Oil", "Namak (Salt)", "Haldi (Turmeric)"
];

export default function GroceryScreen() {
  const { flatId } = useStore();
  const { userProfile } = useAuth();
  const [groceryItems, setGroceryItems] = useState([]);
  const [newItemName, setNewItemName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  // Load groceries
  const loadGroceries = () => {
    setLoading(true);
    getGroceryList(flatId)
      .then(res => {
        setGroceryItems(res.data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch groceries:", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    if (flatId) {
      loadGroceries();
    }
  }, [flatId]);

  // Add Item
  const handleAddItem = (name) => {
    const itemName = name.trim();
    if (!itemName || !flatId) return;

    // Check if item already exists
    const exists = groceryItems.find(item => item.name.toLowerCase() === itemName.toLowerCase());
    if (exists) {
      alert("Yeh item pehle se list mein hai!");
      return;
    }

    const payload = {
      name: itemName,
      added_by: userProfile?.name || "Gharwala",
    };

    addGroceryItem(flatId, payload)
      .then(() => {
        setNewItemName("");
        loadGroceries();
      })
      .catch(err => {
        console.error("Failed to add item:", err);
      });
  };

  // Toggle checked status
  const handleToggleCheck = (item) => {
    const updatedStatus = !item.checked;
    updateGroceryItem(flatId, item.id, { checked: updatedStatus })
      .then(() => {
        // Optimistic update
        setGroceryItems(prev => prev.map(i => i.id === item.id ? { ...i, checked: updatedStatus } : i));
      })
      .catch(console.error);
  };

  // Delete Item
  const handleDeleteItem = (itemId) => {
    deleteGroceryItem(flatId, itemId)
      .then(() => {
        setGroceryItems(prev => prev.filter(i => i.id !== itemId));
      })
      .catch(console.error);
  };

  // Clear all checked items
  const handleClearChecked = () => {
    const checkedItems = groceryItems.filter(item => item.checked);
    if (checkedItems.length === 0) return;
    
    if (window.confirm("Kharide hue items ko list se remove karein?")) {
      const promises = checkedItems.map(item => deleteGroceryItem(flatId, item.id));
      Promise.all(promises)
        .then(() => loadGroceries())
        .catch(console.error);
    }
  };

  // Filtered items based on search query
  const filteredItems = groceryItems.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Suggestions filtered by search or input
  const suggestionsToShow = SUGGESTED_ITEMS.filter(sug => {
    const alreadyInList = groceryItems.some(i => i.name.toLowerCase() === sug.toLowerCase());
    const matchesSearch = sug.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sug.toLowerCase().includes(newItemName.toLowerCase());
    return !alreadyInList && matchesSearch;
  }).slice(0, 5);

  return (
    <div className="min-h-screen bg-[#FDFCF8] pb-24">
      <TopBar title="Ration ki List" subtitle="Shared Household Grocery List" />
      
      <div className="max-w-md mx-auto px-6 pt-6">
        {/* Search & Add Section */}
        <div className="card p-5 mb-6 space-y-4">
          <div className="relative">
            <span className="material-symbols-rounded absolute left-4 top-3.5 text-slate-400">search</span>
            <input 
              type="text"
              placeholder="Search or add items..."
              value={newItemName || searchQuery}
              onChange={(e) => {
                setNewItemName(e.target.value);
                setSearchQuery(e.target.value);
              }}
              className="input-field pl-12"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddItem(newItemName);
                }
              }}
            />
            {(newItemName || searchQuery) && (
              <button 
                onClick={() => {
                  setNewItemName("");
                  setSearchQuery("");
                }}
                className="absolute right-4 top-3.5 text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-rounded">close</span>
              </button>
            )}
          </div>

          {newItemName.trim() && (
            <button 
              onClick={() => handleAddItem(newItemName)}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <span className="material-symbols-rounded">add</span>
              List mein add karein: "{newItemName.trim()}"
            </button>
          )}
        </div>

        {/* Quick Add Suggestions */}
        {suggestionsToShow.length > 0 && (
          <div className="mb-6">
            <p className="section-label mb-2">QUICK ADD / AASAN ENTRY</p>
            <div className="flex flex-wrap gap-2">
              {suggestionsToShow.map(sug => (
                <button
                  key={sug}
                  onClick={() => handleAddItem(sug)}
                  className="chip chip-unselected flex items-center gap-1 text-xs"
                >
                  <span className="material-symbols-rounded text-sm">add</span>
                  {sug}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Main List */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800">
            Grocery Items ({filteredItems.length})
          </h2>
          {groceryItems.some(i => i.checked) && (
            <button 
              onClick={handleClearChecked}
              className="text-xs font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-rounded text-sm">delete_sweep</span>
              Clear Completed
            </button>
          )}
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin w-8 h-8 border-3 border-t-transparent rounded-full" style={{ borderColor: "#56642b", borderTopColor: "transparent" }} />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="card p-8 text-center text-slate-400 font-bold border-2 border-dashed border-slate-200 bg-transparent">
            <span className="material-symbols-rounded text-4xl mb-2">shopping_bag</span>
            <p>{searchQuery ? "Koyi matching item nahi mila!" : "List khaali hai. Add karein!"}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredItems.map(item => (
              <div 
                key={item.id} 
                className={`card p-4 flex items-center justify-between transition-all ${
                  item.checked ? "bg-slate-50/70 border-slate-100" : ""
                }`}
              >
                <div 
                  className="flex items-center gap-3 cursor-pointer flex-1"
                  onClick={() => handleToggleCheck(item)}
                >
                  <div 
                    className={`w-6 h-6 rounded-lg flex items-center justify-center border-2 transition-all ${
                      item.checked 
                        ? "bg-emerald-800 border-emerald-800 text-white" 
                        : "border-slate-300 bg-white"
                    }`}
                  >
                    {item.checked && <span className="material-symbols-rounded text-[18px]">check</span>}
                  </div>
                  <div>
                    <span 
                      className={`text-sm font-bold text-slate-800 transition-all ${
                        item.checked ? "line-through text-slate-400 decoration-slate-300 font-medium" : ""
                      }`}
                    >
                      {item.name}
                    </span>
                    <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                      Added by {item.added_by}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => handleDeleteItem(item.id)}
                  className="text-slate-300 hover:text-rose-600 transition-colors p-1"
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 20 }}>delete</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
