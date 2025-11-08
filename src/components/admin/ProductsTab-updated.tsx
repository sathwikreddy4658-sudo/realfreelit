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
import { Pencil, Trash2, Upload, X, Crop, RotateCcw, RotateCw } from "lucide-react";
import { productSchema } from "@/lib/validation";
import ImageCropper from "@/components/ImageCropper";

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
    price_15g: "",
    price_20g: "",
    stock: "",
    nutrition: "",
    description: "",
    protein: "",
    sugar: "",
    calories: "",
    weight: "",
    shelf_life: "",
    allergens: "",
    min_order_quantity: "",
    is_hidden: false,
  });
  const [productsPageImageFile, setProductsPageImageFile] = useState<File | null>(null);
  const [cartImageFile, setCartImageFile] = useState<File | null>(null);
  const [showCropper, setShowCropper] = useState(false);
  const [cropperImage, setCropperImage] = useState<File | null>(null);
  const [cropperAspect, setCropperAspect] = useState<number>(1);
  const [cropperType, setCropperType] = useState<'products' | 'cart' | 'general' | null>(null);
  const [cropperIndex, setCropperIndex] = useState<number>(-1);

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
      price_15g: "",
      price_20g: "",
      stock: "",
      nutrition: "",
      description: "",
      protein: "",
      sugar: "",
      calories: "",
      weight: "",
      shelf_life: "",
      allergens: "",
      min_order_quantity: "",
      is_hidden: false,
    });
    setEditingProduct(null);
    setImageFiles([]);
    setExistingImages([]);
    setProductsPageImageFile(null);
    setCartImageFile(null);
    setShowCropper(false);
    setCropperImage(null);
    setCropperType(null);
    setCropperIndex(-1);
  };

  const uploadImages = async (productId: string): Promise<string[]> => {
    const uploadedUrls: string[] = [];

    // Upload images in parallel batches of 3 to avoid overwhelming the server
    const batchSize = 3;
    for (let i = 0; i < imageFiles.length; i += batchSize) {
      const batch = imageFiles.slice(i, i + batchSize);
      const batchPromises = batch.map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${productId}/${Date.now()}-${Math.random()}.${fileExt}`;

        const { error: uploadError, data } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            cacheControl: '3600', // Add caching for better performance
            upsert: false
          });

        if (uploadError) {
          console.error('Upload error:', uploadError);
          return null;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        return publicUrl;
      });

      const batchResults = await Promise.all(batchPromises);
      uploadedUrls.push(...batchResults.filter(url => url !== null));
    }

    return uploadedUrls;
  };

  const uploadSingleImage = async (file: File, productId: string, type: string): Promise<string | null> => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${productId}/${type}-${Date.now()}.${fileExt}`;

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, file);

    if (uploadError) {
      console.error(`Upload error for ${type}:`, uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);

    return publicUrl;
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

  const openCropper = (file: File, type: 'products' | 'cart' | 'general', index: number = -1) => {
    setCropperImage(file);
    setCropperType(type);
    setCropperIndex(index);
    setCropperAspect(type === 'products' ? 1 : type === 'cart' ? 1 : 1);
    setShowCropper(true);
  };

  const handleCropComplete = (croppedFile: File) => {
    if (cropperType === 'products') {
      setProductsPageImageFile(croppedFile);
    } else if (cropperType === 'cart') {
      setCartImageFile(croppedFile);
    } else if (cropperType === 'general' && cropperIndex >= 0) {
      setImageFiles(prev => {
        const newFiles = [...prev];
        newFiles[cropperIndex] = croppedFile;
        return newFiles;
      });
    }
    setShowCropper(false);
    setCropperImage(null);
    setCropperType(null);
    setCropperIndex(-1);
  };

  const handleCropCancel = () => {
    setShowCropper(false);
    setCropperImage(null);
    setCropperType(null);
    setCropperIndex(-1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadingImages(true);

    try {
      // Validate numeric fields before parsing
      const price = formData.price ? parseFloat(formData.price) : 0;
      const price15g = parseFloat(formData.price_15g);
      const price20g = parseFloat(formData.price_20g);
      const stock = parseInt(formData.stock);
      const minOrderQuantity = formData.min_order_quantity ? parseInt(formData.min_order_quantity) : undefined;

      // Check for NaN values
      if (isNaN(price15g) || isNaN(price20g) || isNaN(stock) ||
          (minOrderQuantity !== undefined && isNaN(minOrderQuantity))) {
        toast({
          title: "Validation failed",
          description: "Please enter valid numeric values for price, stock, and quantity fields",
          variant: "destructive"
        });
        return;
      }

      const productData = {
        ...formData,
        category: formData.category as "protein_bars" | "dessert_bars" | "chocolates",
        price: price || undefined,
        price_15g: price15g,
        price_20g: price20g,
        stock,
        min_order_quantity: minOrderQuantity,
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

        // Upload separate images
        let productsPageImageUrl = editingProduct.products_page_image;
        let cartImageUrl = editingProduct.cart_image;

        if (productsPageImageFile) {
          productsPageImageUrl = await uploadSingleImage(productsPageImageFile, editingProduct.id, 'products-page');
        }

        if (cartImageFile) {
          cartImageUrl = await uploadSingleImage(cartImageFile, editingProduct.id, 'cart');
        }

        const { error } = await supabase
          .from("products")
          .update({
            ...validatedData,
            images: allImages,
            products_page_image: productsPageImageUrl,
            cart_image: cartImageUrl
          })
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

          // Upload separate images
          let productsPageImageUrl = null;
          let cartImageUrl = null;

          if (productsPageImageFile) {
            productsPageImageUrl = await uploadSingleImage(productsPageImageFile, newProduct.id, 'products-page');
          }

          if (cartImageFile) {
            cartImageUrl = await uploadSingleImage(cartImageFile, newProduct.id, 'cart');
          }

          // Update product with image URLs
          await supabase
            .from("products")
            .update({
              images: imageUrls,
              products_page_image: productsPageImageUrl,
              cart_image: cartImageUrl
            })
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
      price: product.price?.toString() || "",
      price_15g: product.price_15g?.toString() || "",
      price_20g: product.price_20g?.toString() || "",
      stock: product.stock.toString(),
      nutrition: product.nutrition,
      description: product.description || "",
      protein: product.protein || "",
      sugar: product.sugar || "",
      calories: product.calories || "",
      weight: product.weight || "",
      shelf_life: product.shelf_life || "",
      allergens: product.allergens || "",
      min_order_quantity: product.min_order_quantity?.toString() || "",
      is_hidden: product.is_hidden || false,
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

              <div>
                <Label>Price (₹)</Label>
                <Input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Price 15g (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price_15g}
                    onChange={(e) => setFormData({ ...formData, price_15g: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label>Price 20g (₹) *</Label>
                  <Input
                    type="number"
                    value={formData.price_20g}
                    onChange={(e) => setFormData({ ...formData, price_20g: e.target.value })}
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
                <div>
                  <Label>Min Order Quantity</Label>
                  <Input
                    type="number"
                    value={formData.min_order_quantity}
                    onChange={(e) => setFormData({ ...formData, min_order_quantity: e.target.value })}
                    placeholder="Leave empty for no minimum"
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

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_hidden"
                  checked={formData.is_hidden}
                  onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="is_hidden">Hidden (won't be displayed on the website)</Label>
              </div>

              <div>
                <Label>Product Images (General)</Label>
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
                            <div className="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                              <Button
                                type="button"
                                size="sm"
                                variant="secondary"
                                className="h-6 w-6 p-0 bg-white hover:bg-gray-100 text-black border shadow-sm"
                                onClick={() => openCropper(file, 'general', index)}
                              >
                                <Crop className="h-3 w-3" />
                              </Button>
                              <Button
                                type="button"
                                size="sm"
                                variant="destructive"
                                className="h-6 w-6 p-0 shadow-sm"
                                onClick={() => removeImageFile(index)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Products Page Image (192x192px)</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setProductsPageImageFile(e.target.files?.[0] || null)}
                      className="w-full"
                    />
                    {productsPageImageFile && (
                      <div className="w-24 h-24 border rounded overflow-hidden">
                        <img
                          src={URL.createObjectURL(productsPageImageFile)}
                          alt="Products page preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {editingProduct?.products_page_image && !productsPageImageFile && (
                      <div className="w-24 h-24 border rounded overflow-hidden">
                        <img
                          src={editingProduct.products_page_image}
                          alt="Current products page image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Cart Image (64x64px)</Label>
                  <div className="space-y-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => setCartImageFile(e.target.files?.[0] || null)}
                      className="w-full"
                    />
                    {cartImageFile && (
                      <div className="w-16 h-16 border rounded overflow-hidden">
                        <img
                          src={URL.createObjectURL(cartImageFile)}
                          alt="Cart preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    {editingProduct?.cart_image && !cartImageFile && (
                      <div className="w-16 h-16 border rounded overflow-hidden">
                        <img
                          src={editingProduct.cart_image}
                          alt="Current cart image"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                  </div>
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
            <p className="text-primary font-bold mb-1">
              {product.price ? `₹${product.price}` : `₹${product.price_15g} - ₹${product.price_20g}`}
            </p>
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

      {showCropper && cropperImage && (
        <ImageCropper
          imageFile={cropperImage}
          aspect={cropperAspect}
          onCropComplete={handleCropComplete}
          onCancel={handleCropCancel}
        />
      )}
    </div>
  );
};

export default ProductsTab;
