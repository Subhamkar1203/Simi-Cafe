"use client";

import { useEffect, useState, FormEvent } from "react";
import { PlusLg, PencilSquare, Trash, XLg } from "react-bootstrap-icons";
import { Pagination } from "@/components/pagination";
import { toaster } from "@/components/toaster";

interface MenuItem {
  id: number;
  category_id: number;
  category_name: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  diet_type_id: number;
  diet_type_name: string;
  is_available: boolean;
  is_seasonal: boolean;
  tags: string; // comma separated IDs
  tag_names: string; // comma separated names
}

interface Category {
  id: number;
  name: string;
}

interface DietType {
  id: number;
  name: string;
}

interface Tag {
  id: number;
  name: string;
}

const emptyForm = {
  name: "",
  description: "",
  price: "",
  image_url: "",
  category_id: "",
  diet_type_id: "",
  is_available: true,
  is_seasonal: false,
  tags: [] as string[],
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [dietTypes, setDietTypes] = useState<DietType[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  const fetchItems = () => {
    Promise.all([
      fetch("/api/menu").then(res => res.json()),
      fetch("/api/diet-types").then(res => res.json()),
      fetch("/api/tags").then(res => res.json())
    ]).then(([menuData, dietData, tagsData]) => {
      setItems(menuData.items ?? []);
      setCategories(menuData.categories ?? []);
      setDietTypes(dietData.dietTypes ?? []);
      setAllTags(tagsData.tags ?? []);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setSelectedFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const closeForm = () => {
    setShowForm(false);
    setForm(emptyForm);
    setSelectedFile(null);
    setEditingId(null);
  };

  const openEdit = (item: MenuItem) => {
    setEditingId(item.id);
    setSelectedFile(null);
    setForm({
      name: item.name,
      description: item.description || "",
      price: String(item.price),
      image_url: item.image_url || "",
      category_id: String(item.category_id),
      diet_type_id: String(item.diet_type_id || ""),
      is_available: Boolean(item.is_available),
      is_seasonal: Boolean(item.is_seasonal),
      tags: item.tags ? item.tags.split(",") : [],
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setUploading(true);

    let finalImageUrl = form.image_url;

    // Upload file if selected
    if (selectedFile) {
      const formData = new FormData();
      formData.append("file", selectedFile);
      
      try {
        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          finalImageUrl = uploadData.url;
        } else {
          toaster.create({ title: "Upload Failed", description: "Failed to upload image", type: "error" });
          setUploading(false);
          return;
        }
      } catch (err) {
        toaster.create({ title: "Upload Error", description: "An error occurred during upload", type: "error" });
        setUploading(false);
        return;
      }
    }

    if (!form.name.trim()) {
      toaster.create({ title: "Validation Error", description: "Name is required.", type: "error" });
      setUploading(false);
      return;
    }

    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) {
      toaster.create({ title: "Validation Error", description: "Please enter a valid positive price.", type: "error" });
      setUploading(false);
      return;
    }

    const categoryIdNum = parseInt(form.category_id);
    if (isNaN(categoryIdNum)) {
      toaster.create({ title: "Validation Error", description: "Please select a category.", type: "error" });
      setUploading(false);
      return;
    }

    const dietTypeIdNum = form.diet_type_id ? parseInt(form.diet_type_id) : null;

    const method = editingId ? "PUT" : "POST";
    const body = {
      ...(editingId ? { id: editingId } : {}),
      name: form.name,
      description: form.description,
      price: priceNum,
      image_url: finalImageUrl,
      category_id: categoryIdNum,
      diet_type_id: dietTypeIdNum,
      is_available: form.is_available,
      is_seasonal: form.is_seasonal,
      tags: form.tags.map(t => parseInt(t)),
    };

    let res;
    try {
      res = await fetch("/api/menu", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
    } catch (e) {
      toaster.create({ title: "Network Error", description: "Failed to connect to the server.", type: "error" });
      setUploading(false);
      return;
    }

    setUploading(false);

    if (res.ok) {
      setShowForm(false);
      setForm(emptyForm);
      setSelectedFile(null);
      setEditingId(null);
      toaster.create({ title: "Success", description: editingId ? "Item updated successfully." : "Item created successfully.", type: "success" });
      fetchItems();
    } else {
      let errorMessage = "Failed to save item.";
      try {
        const errorData = await res.json();
        if (errorData.details && errorData.details.length > 0) {
          errorMessage = errorData.details.map((d: any) => `${d.path}: ${d.message}`).join(", ");
        } else if (errorData.error) {
          errorMessage = errorData.error;
        }
      } catch (e) {}
      toaster.create({ title: "Validation Error", description: errorMessage, type: "error" });
    }
  };

  const handleCreateCategory = async () => {
    const name = window.prompt("Enter new category name:");
    if (!name || name.trim() === "") return;

    setUploading(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        // Optimistically add to list and select it
        const newCat = { id: data.id, name: name.trim() };
        setCategories([...categories, newCat]);
        setForm({ ...form, category_id: String(data.id) });
        toaster.create({ title: "Success", description: "Category created.", type: "success" });
      } else {
        toaster.create({ title: "Error", description: "Failed to create category", type: "error" });
      }
    } catch (e) {
      toaster.create({ title: "Error", description: "Error creating category", type: "error" });
    }
    setUploading(false);
  };

  const handleCreateDietType = async () => {
    const name = window.prompt("Enter new dietary type (e.g., Eggitarian, Jain):");
    if (!name || name.trim() === "") return;

    setUploading(true);
    try {
      const res = await fetch("/api/diet-types", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const newDiet = { id: data.id, name: name.trim() };
        setDietTypes([...dietTypes, newDiet]);
        setForm({ ...form, diet_type_id: String(data.id) });
        toaster.create({ title: "Success", description: "Diet type created.", type: "success" });
      } else {
        toaster.create({ title: "Error", description: "Failed to create dietary type", type: "error" });
      }
    } catch (e) {
      toaster.create({ title: "Error", description: "Error creating dietary type", type: "error" });
    }
    setUploading(false);
  };

  const handleCreateTag = async () => {
    const name = window.prompt("Enter new tag name (e.g., Chef's Special, Spicy):");
    if (!name || name.trim() === "") return;

    setUploading(true);
    try {
      const res = await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });
      if (res.ok) {
        const data = await res.json();
        const newTag = { id: data.id, name: name.trim() };
        setAllTags([...allTags, newTag]);
        setForm({ ...form, tags: [...form.tags, String(data.id)] });
        toaster.create({ title: "Success", description: "Tag created.", type: "success" });
      } else {
        toaster.create({ title: "Error", description: "Failed to create tag", type: "error" });
      }
    } catch (e) {
      toaster.create({ title: "Error", description: "Error creating tag", type: "error" });
    }
    setUploading(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const res = await fetch("/api/menu", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      toaster.create({ title: "Deleted", description: "Item removed from menu.", type: "info" });
      fetchItems();
    } else {
      toaster.create({ title: "Error", description: "Failed to delete item.", type: "error" });
    }
  };

  const toggleAvailability = async (item: MenuItem) => {
    const res = await fetch("/api/menu", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, is_available: !item.is_available }),
    });
    if (res.ok) {
      toaster.create({ title: "Updated", description: `${item.name} is now ${!item.is_available ? 'available' : 'unavailable'}.`, type: "success" });
      fetchItems();
    } else {
      toaster.create({ title: "Error", description: "Failed to update availability.", type: "error" });
    }
  };

  const totalPages = Math.ceil(items.length / ITEMS_PER_PAGE);
  const paginatedItems = items.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

  return (
    <main className="main-content">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Menu Items</h1>
          <p>Manage your café menu</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <PlusLg size={16} /> Add Item
        </button>
      </div>

      {showForm && (
        <div className="data-table-container" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 600 }}>
              {editingId ? "Edit Item" : "Add New Item"}
            </h2>
            <button onClick={closeForm} style={{ background: "none", border: "none", cursor: "pointer" }}>
              <XLg size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <div style={{ display: "flex", gap: "0.5rem" }}>
                  <select
                    style={{ flex: 1 }}
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                    required
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ padding: "0 0.5rem" }}
                    onClick={handleCreateCategory}
                    title="Create New Category"
                  >
                    <PlusLg size={16} />
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label>Price (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>Image</label>
                {form.image_url && !selectedFile && (
                  <div style={{ marginBottom: "0.5rem" }}>
                    <img src={form.image_url} alt="Current" style={{ width: 60, height: 60, objectFit: "cover", borderRadius: "0.375rem" }} />
                    <div style={{ fontSize: "0.75rem", color: "var(--admin-text-muted)" }}>Current Image</div>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                />
              </div>

              <div className="form-group" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", paddingBottom: "0.5rem", gridColumn: "1 / -1" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", flex: "1 1 300px" }}>
                  <label style={{ fontWeight: 600, fontSize: "0.85rem", color: "var(--admin-text-muted)" }}>Diet Type:</label>
                  <div style={{ display: "flex", gap: "0.5rem", flex: 1 }}>
                    <select
                      style={{ flex: 1 }}
                      value={form.diet_type_id}
                      onChange={(e) => setForm({ ...form, diet_type_id: e.target.value })}
                    >
                      <option value="">Select Diet Type (Optional)</option>
                      {dietTypes.map((d) => (
                        <option key={d.id} value={d.id}>{d.name}</option>
                      ))}
                    </select>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      style={{ padding: "0 0.5rem" }}
                      onClick={handleCreateDietType}
                      title="Create New Diet Type"
                    >
                      <PlusLg size={16} />
                    </button>
                  </div>
                </div>
                <div style={{ borderLeft: "1px solid var(--admin-border)", height: "24px" }} />

                <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={form.is_available}
                      onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Available
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 500 }}>
                    <input
                      type="checkbox"
                      checked={form.is_seasonal}
                      onChange={(e) => setForm({ ...form, is_seasonal: e.target.checked })}
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    Seasonal (Special)
                  </label>
                  <div style={{ borderLeft: "1px solid var(--admin-border)", height: "24px", margin: "0 0.5rem" }} />
                  {allTags.map((tag) => (
                    <label key={tag.id} style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontWeight: 500, color: "var(--admin-text)" }}>
                      <input
                        type="checkbox"
                        checked={form.tags.includes(String(tag.id))}
                        onChange={(e) => {
                          const idStr = String(tag.id);
                          if (e.target.checked) {
                            setForm({ ...form, tags: [...form.tags, idStr] });
                          } else {
                            setForm({ ...form, tags: form.tags.filter(t => t !== idStr) });
                          }
                        }}
                        className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      />
                      {tag.name}
                    </label>
                  ))}
                  <button 
                    type="button" 
                    className="btn btn-outline" 
                    style={{ padding: "0 0.5rem", height: "28px" }}
                    onClick={handleCreateTag}
                    title="Create New Tag"
                  >
                    <PlusLg size={14} /> Add Tag
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                rows={2}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </div>

            <div className="form-actions" style={{ display: "flex", gap: "0.5rem" }}>
              <button type="button" className="btn" onClick={closeForm} disabled={uploading}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={uploading}>
                {uploading ? "Saving..." : editingId ? "Update Item" : "Create Item"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="data-table-container">
        <table className="data-table">
          <thead>
            <tr className="desktop-table-header">
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Type</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>Loading...</td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: "center", color: "var(--admin-text-muted)" }}>No menu items</td>
              </tr>
            ) : (
              paginatedItems.map((item) => (
                <tr key={item.id}>
                  <td data-label="Name" style={{ fontWeight: 500, display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} style={{ width: 40, height: 40, borderRadius: "0.375rem", objectFit: "cover" }} />
                    ) : (
                      <div style={{ width: 40, height: 40, borderRadius: "0.375rem", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center", color: "#9ca3af", fontSize: "0.7rem" }}>No Img</div>
                    )}
                    {item.name}
                  </td>
                  <td data-label="Category">{item.category_name}</td>
                  <td data-label="Price">₹{Number(item.price).toFixed(2)}</td>
                  <td data-label="Type">
                    <span style={{
                      display: "inline-block",
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: item.diet_type_name === "Veg" ? "#10b981" : item.diet_type_name === "Vegan" ? "#059669" : item.diet_type_name === "Non-Veg" ? "#ef4444" : "#f59e0b",
                      marginRight: 6,
                    }} />
                    {item.diet_type_name || "Unknown"}
                  </td>
                  <td data-label="Tags" style={{ maxWidth: 150, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {item.tag_names ? item.tag_names : <span style={{ color: "var(--admin-text-muted)" }}>None</span>}
                  </td>
                  <td data-label="Available">
                    <button
                      className={`toggle ${item.is_available ? "active" : ""}`}
                      onClick={() => toggleAvailability(item)}
                    />
                  </td>
                  <td data-label="Actions">
                    <div style={{ display: "flex", gap: "0.5rem" }}>
                      <button className="btn btn-outline btn-sm" onClick={() => openEdit(item)}>
                        <PencilSquare size={14} />
                      </button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(item.id)}>
                        <Trash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </div>
    </main>
  );
}
