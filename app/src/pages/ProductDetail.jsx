// pages/ProductDetail.jsx
import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ShoppingCart,
  Heart,
  Share2,
  Check,
  Star,
} from "lucide-react";
import { productService } from "../services/productService";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isAdded, setIsAdded] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const productData = await productService.getProduct(id);
      setProduct(productData);
    } catch (err) {
      setError("Product not found");
      console.error("Error fetching product:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `R${parseFloat(price).toLocaleString("en-ZA", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleAddToCart = () => {
    if (!product) return;

    // Get current cart from localStorage
    const currentCart = JSON.parse(localStorage.getItem("cart") || "[]");

    // Check if product already exists in cart
    const existingProductIndex = currentCart.findIndex(
      (item) => item.id === product.id,
    );

    let updatedCart;
    if (existingProductIndex > -1) {
      // Update quantity if product exists
      updatedCart = currentCart.map((item, index) =>
        index === existingProductIndex
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    } else {
      // Add new product to cart
      updatedCart = [...currentCart, { ...product, quantity: 1 }];
    }

    // Save to localStorage
    localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Show success feedback
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);

    // Dispatch custom event to notify other components
    window.dispatchEvent(new Event("cartUpdated"));

    console.log("Added to cart:", product);
  };

  const handleBuyNow = () => {
    // Add to cart first, then navigate to checkout
    handleAddToCart();
    // Navigate to checkout page (you can change this route as needed)
    navigate("/checkout");
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="spinner mb-4"></div>
          <p className="text-gray-600">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="pt-16 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Get primary image or first image
  const primaryImage =
    product.image_objects?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0] ||
    "https://via.placeholder.com/600x600?text=No+Image";

  // Get all images for gallery
  const productImages =
    product.images?.length > 0 ? product.images : [primaryImage];

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Products
          </button>
        </div>

        {/* Product Details */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8">
            {/* Product Images */}
            <div className="space-y-4">
              {/* Main Image */}
              <div className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden">
                <img
                  src={productImages[selectedImage]}
                  alt={product.name}
                  className="w-full h-96 object-cover"
                  onError={(e) => {
                    e.target.src =
                      "https://via.placeholder.com/600x600?text=No+Image";
                  }}
                />
              </div>

              {/* Image Thumbnails */}
              {productImages.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-20 h-20 bg-gray-100 rounded border-2 overflow-hidden ${
                        selectedImage === index
                          ? "border-blue-500"
                          : "border-transparent"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="space-y-6">
              <div>
                <span className="inline-block bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full mb-2">
                  {product.category_name || product.category}
                </span>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {product.name}
                </h1>
                <p className="text-gray-600 mb-4">{product.brand}</p>

                {/* Price and Stock Info */}
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex flex-col">
                    <span className="text-3xl font-bold text-green-600">
                      {formatPrice(product.retail_price)}
                    </span>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.stock_quantity > 0
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.stock_quantity > 0
                      ? `${product.stock_quantity} in stock`
                      : "Out of stock"}
                  </span>
                </div>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Description</h3>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                </div>
              )}

              {product.specifications && (
                <div>
                  <h3 className="text-lg font-semibold mb-2">Specifications</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    {typeof product.specifications === "object" &&
                    !Array.isArray(product.specifications) ? (
                      Object.entries(product.specifications).map(
                        ([key, value]) => (
                          <div key={key} className="text-sm">
                            <span className="font-semibold text-gray-700 capitalize">
                              {key}:{" "}
                            </span>
                            <span className="text-gray-600">
                              {String(value)}
                            </span>
                          </div>
                        ),
                      )
                    ) : (
                      <p className="text-gray-700">
                        {String(product.specifications)}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-4 pt-4">
                <div className="flex space-x-4">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.stock_quantity === 0 || isAdded}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center ${
                      isAdded
                        ? "bg-green-600 text-white"
                        : product.stock_quantity === 0
                          ? "bg-gray-400 text-gray-200 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white hover:shadow-md"
                    }`}
                  >
                    {isAdded ? (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        <span>Added to Cart!</span>
                      </>
                    ) : product.stock_quantity === 0 ? (
                      <span>Out of Stock</span>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5 mr-2" />
                        <span>Add to Cart</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={product.stock_quantity === 0}
                    className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                  >
                    Buy Now
                  </button>
                </div>

                <div className="flex space-x-4">
                  <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Heart className="w-5 h-5 mr-2" />
                    Add to Wishlist
                  </button>
                  <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                    <Share2 className="w-5 h-5 mr-2" />
                    Share
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              <div className="border-t pt-4">
                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                  <div>
                    <span className="font-semibold">Category:</span>
                    <span className="ml-2 capitalize">
                      {product.category_name || product.category}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Brand:</span>
                    <span className="ml-2">{product.brand}</span>
                  </div>
                  <div>
                    <span className="font-semibold">Availability:</span>
                    <span
                      className={`ml-2 ${
                        product.stock_quantity > 0
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {product.stock_quantity > 0 ? "In Stock" : "Out of Stock"}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold">Status:</span>
                    <span
                      className={`ml-2 ${
                        product.is_active ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {product.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products Section (Optional) */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-6">Related Products</h2>
          {/* You can implement related products here */}
          <div className="text-center py-8 text-gray-500">
            Related products will be displayed here
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
