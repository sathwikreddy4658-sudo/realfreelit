import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Pencil, Trash2, Upload, X } from "lucide-react";
import { productSchema } from "@/lib/validation";

const ProductsTab = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    category: "protein_bars",
    price: "",
    stock: "",
    nutrition: "",
    description: "",
    protein: "",
    sugar: "",
    calories: "",
    weight: "",
    shelf_life: "",
    allergens: "",
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (data) setProducts(data);
  };

  const resetForm = () => {
    setFormData({
      name: "",
      category: "protein_bars",
      price: "",
      stock: "",
      nutrition: "",
      description: "",
      protein: "",
      sugar: "",
      calories: "",
      weight: "",
      shelf_life: "",
      allergens: "",
    });
    setEditingProduct(null);
    setImageFiles([]);
    setExistingImages([]);
  };

  const uploadImages = async (productId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];
    
    for (const file of imageFiles) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}/${Date.now()}-${Math.random()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);
      
      if (uploadError) {
        console.error('Upload error:', uploadError);
        continue;
      }
      
      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);
      
      uploadedUrls.push(publicUrl);
    }
    
    return uploadedUrls;
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setImageFiles(prev => [...prev, ...files]);
    }
  };

  const removeImageFile = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingImages(true);

    try {
      const productData = {
        ...formData,
        category: formData.category as "protein_bars" | "dessert_bars" | "chocolates",
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
      };

      // Validate product data before submitting
      const validationResult = productSchema.safeParse(productData);
      if (!validationResult.success) {
        const firstError = validationResult.error.errors[0];
        toast({ 
          title: "Validation failed", 
          description: firstError.message, 
          variant: "destructive" 
        });
        return;
      }

      const validatedData = validationResult.data as any;

      if (editingProduct) {
        // Upload new images if any
        let newImageUrls: string[] = [];
        if (imageFiles.length > 0) {
          newImageUrls = await uploadImages(editingProduct.id);
        }

        // Combine existing and new images
        const allImages = [...existingImages, ...newImageUrls];

        const { error } = await supabase
          .from("products")
          .update({ ...validatedData, images: allImages })
          .eq("id", editingProduct.id);

        if (error) {
          toast({ title: "Update failed", variant: "destructive" });
        } else {
          toast({ title: "Product updated successfully" });
          setShowDialog(false);
          resetForm();
          fetchProducts();
        }
      } else {
        // Create product first
        const { data: newProduct, error: insertError } = await supabase
          .from("products")
          .insert([validatedData])
          .select()
          .single();

        if (insertError || !newProduct) {
          toast({ title: "Creation failed", variant: "destructive" });
          return;
        }

        // Upload images if any
        if (imageFiles.length > 0) {
          const imageUrls = await uploadImages(newProduct.id);
          
          // Update product with image URLs
          await supabase
            .from("products")
            .update({ images: imageUrls })
            .eq("id", newProduct.id);
        }

        toast({ title: "Product created successfully" });
        setShowDialog(false);
        resetForm();
        fetchProducts();
      }
    } finally {
      setUploadingImages(false);
    }
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      stock: product.stock.toString(),
      nutrition: product.nutrition,
      description: product.description || "",
      protein: product.protein || "",
      sugar: product.sugar || "",
      calories: product.calories || "",
      weight: product.weight || "",
      shelf_life: product.shelf_life || "",
      allergens: product.allergens || "",
    });
    setExistingImages(product.images || []);
    setImageFiles([]);
    setShowDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      toast({ title: "Deletion failed", variant: "destructive" });
    } else {
      toast({ title: "Product deleted successfully" });
      fetchProducts();
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Products Management</h2>
        <Dialog open={showDialog} onOpenChange={(open) => {
          setShowDialog(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button>Add Product</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingProduct ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Name *</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Category *</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="protein_bars">Protein Bars</SelectItem>
                    <SelectItem value="dessert_bars">Dessert Bars</SelectItem>
                    <SelectItem value="chocolates">Chocolates</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Stock *</Label>
                  <Input
                    type="number"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <Label>Nutrition *</Label>
                <Input
                  value={formData.nutrition}
                  onChange={(e) => setFormData({ ...formData, nutrition: e.target.value })}
                  required
                />
              </div>

              <div>
                <Label>Description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Protein</Label>
                  <Input
                    value={formData.protein}
                    onChange={(e) => setFormData({ ...formData, protein: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Sugar</Label>
                  <Input
                    value={formData.sugar}
                    onChange={(e) => setFormData({ ...formData, sugar: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Calories</Label>
                  <Input
                    value={formData.calories}
                    onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Weight</Label>
                  <Input
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Shelf Life</Label>
                  <Input
                    value={formData.shelf_life}
                    onChange={(e) => setFormData({ ...formData, shelf_life: e.target.value })}
                  />
                </div>
              <div>
                <Label>Allergens</Label>
                <Input
                  value={formData.allergens}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                />
              </div>
              </div>

              <div>
                <Label>Product Images</Label>
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="flex-1"
                    />
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </div>

                  {existingImages.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">Existing Images:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {existingImages.map((url, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={url} 
                              alt={`Product ${index + 1}`} 
                              className="w-full h-20 object-cover rounded"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() => removeExistingImage(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {imageFiles.length > 0 && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-2">New Images to Upload:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {imageFiles.map((file, index) => (
                          <div key={index} className="relative group">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt={`New ${index + 1}`} 
                              className="w-full h-20 object-cover rounded"
                            />
                            <Button
                              type="button"
                              size="sm"
                              variant="destructive"
                              className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                              onClick={() => removeImageFile(index)}
                            >
                              <X className="h-3 w-3" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={uploadingImages}>
                {uploadingImages ? "Uploading..." : editingProduct ? "Update" : "Create"} Product
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="p-4">
            {product.images && product.images.length > 0 ? (
              <img 
                src={product.images[0]} 
                alt={product.name}
                className="h-32 w-full object-cover rounded-lg mb-3"
              />
            ) : (
              <div className="h-32 bg-muted rounded-lg mb-3 flex items-center justify-center text-muted-foreground">
                No image
              </div>
            )}
            <h3 className="font-semibold mb-1">{product.name}</h3>
            <p className="text-primary font-bold mb-1">₹{product.price}</p>
            <p className="text-sm text-muted-foreground mb-3">Stock: {product.stock}</p>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={() => handleEdit(product)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="destructive" onClick={() => handleDelete(product.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ProductsTab;
