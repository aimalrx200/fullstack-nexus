// apps/nexus-commerce/frontend/src/components/admin/inventory/ProductCreationModal.jsx

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  UploadCloud,
  X,
  Plus,
  Sparkles,
  Package,
  CheckCircle2,
  Tag,
  DollarSign,
  Video,
  Film,
} from "lucide-react";
import { Modal } from "../../common/Modal";
import { Button } from "../../common/Button";
import { useCurrency } from "../../../hooks/useCurrency";
import { adminApi } from "../../../lib/api/adminApi";
import { toast } from "sonner";

const PRESET_CATEGORIES = [
  "Electronics",
  "Apparel",
  "Footwear",
  "Accessories",
  "Watches",
  "Home & Living",
];

const generateUniqueSku = (baseTitle = "") => {
  const clean = baseTitle
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
  const randomSuffix = Math.floor(100 + Math.random() * 900); // e.g. 742
  return `NEX-${clean || "PROD"}-${randomSuffix}`;
};

const compressImage = (file, maxWidth = 1200, quality = 0.8) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith("image/")) return resolve(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(
                new File([blob], file.name.replace(/\.[^.]+$/, ".webp"), {
                  type: "image/webp",
                  lastModified: Date.now(),
                }),
              );
            } else {
              resolve(file);
            }
          },
          "image/webp",
          quality,
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target.result;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
};

function ProductCreationFormContent({ onSave, onClose, isLoading }) {
  const { exchangeRate } = useCurrency();

  // Basic Info
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Electronics");
  const [isFeatured, setIsFeatured] = useState(false);

  // Pricing
  const [basePriceUSD, setBasePriceUSD] = useState("");
  const [basePricePKR, setBasePricePKR] = useState("");

  // Tags
  const [tags, setTags] = useState(["Featured", "New Arrival"]);
  const [tagInput, setTagInput] = useState("");

  // Variant SKU
  const [variantTitle, setVariantTitle] = useState("Standard Edition");
  const [sku, setSku] = useState(() => generateUniqueSku());
  const [initialStock, setInitialStock] = useState("25");
  const [lowStockThreshold, setLowStockThreshold] = useState("5");

  // Media
  const [images, setImages] = useState([]);
  const [isCompressing, setIsCompressing] = useState(false);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState("");
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  const handleTitleChange = (val) => {
    setTitle(val);
    setSku(generateUniqueSku(val));
  };

  const handleUSDChange = (val) => {
    setBasePriceUSD(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setBasePricePKR(String(Math.round(num * exchangeRate)));
    } else {
      setBasePricePKR("");
    }
  };

  const onDropImages = useCallback(
    async (acceptedFiles) => {
      if (!acceptedFiles.length) return;
      setIsCompressing(true);

      try {
        const processedFiles = await Promise.all(
          acceptedFiles.slice(0, 5 - images.length).map(async (file) => {
            const compressed = await compressImage(file);
            return {
              file: compressed,
              preview: URL.createObjectURL(compressed),
              name: file.name,
            };
          }),
        );
        setImages((prev) => [...prev, ...processedFiles].slice(0, 5));
      } finally {
        setIsCompressing(false);
      }
    },
    [images.length],
  );

  const {
    getRootProps: getImageProps,
    getInputProps: getImageInputProps,
    isDragActive: isImageDragActive,
  } = useDropzone({
    onDrop: onDropImages,
    accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".avif"] },
    maxFiles: 5,
    disabled: isCompressing || images.length >= 5,
  });

  const removeImage = (index) => {
    setImages((prev) => {
      const item = prev[index];
      if (item?.preview) URL.revokeObjectURL(item.preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const onDropVideo = useCallback((acceptedFiles) => {
    if (!acceptedFiles.length) return;
    const file = acceptedFiles[0];

    if (file.size > 50 * 1024 * 1024) {
      toast.error("Video file size cannot exceed 50MB.");
      return;
    }

    setVideoFile(file);
    setVideoPreviewUrl(URL.createObjectURL(file));
  }, []);

  const {
    getRootProps: getVideoProps,
    getInputProps: getVideoInputProps,
    isDragActive: isVideoDragActive,
  } = useDropzone({
    onDrop: onDropVideo,
    accept: { "video/*": [".mp4", ".webm", ".mov"] },
    maxFiles: 1,
    multiple: false,
  });

  const removeVideo = () => {
    if (videoPreviewUrl) URL.revokeObjectURL(videoPreviewUrl);
    setVideoFile(null);
    setVideoPreviewUrl("");
  };

  const addTag = (e) => {
    e.preventDefault();
    const clean = tagInput.trim();
    if (clean && !tags.includes(clean)) {
      setTags([...tags, clean]);
      setTagInput("");
    }
  };

  const removeTag = (t) => {
    setTags(tags.filter((item) => item !== t));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let uploadedVideoData = null;

    if (videoFile) {
      setIsUploadingVideo(true);
      try {
        uploadedVideoData = await adminApi.uploadVideo(videoFile, (pct) =>
          setVideoProgress(pct),
        );
      } catch {
        toast.error("Video upload failed. Proceeding without video.");
      } finally {
        setIsUploadingVideo(false);
      }
    }

    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
    formData.append("basePriceUSD", basePriceUSD);
    formData.append("basePricePKR", basePricePKR);
    formData.append("isFeatured", String(isFeatured));
    formData.append("tags", JSON.stringify(tags));

    if (uploadedVideoData) {
      formData.append("video", JSON.stringify(uploadedVideoData));
    }

    images.forEach((img) => {
      formData.append("images", img.file);
    });

    const initialVariantPayload = {
      sku: sku.trim().toUpperCase() || generateUniqueSku(title),
      title: variantTitle.trim() || "Standard Edition",
      stock: Number(initialStock) || 0,
      lowStockThreshold: Number(lowStockThreshold) || 5,
      priceOverrideUSD: Number(basePriceUSD),
      priceOverridePKR: Number(basePricePKR),
    };

    onSave({ formData, variantData: initialVariantPayload });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 max-h-[75dvh] overflow-y-auto pr-1 custom-scrollbar"
    >
      {/* Section 1: Title & Category */}
      <div className="space-y-3">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-text-main">
            Product Title <span className="text-brand-primary">*</span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. Bass Pulse Subwoofer"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full min-h-11 px-3.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-xs font-medium text-text-muted">
              Category <span className="text-brand-primary">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full min-h-11 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary cursor-pointer"
            >
              {PRESET_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1 flex flex-col justify-end pb-1.5">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 rounded border-border-main text-brand-primary focus:ring-0 cursor-pointer"
              />
              <span className="text-xs font-medium text-text-main flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Feature on Storefront Hero</span>
              </span>
            </label>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-text-muted">
            Description <span className="text-brand-primary">*</span>
          </label>
          <textarea
            required
            rows={3}
            placeholder="Describe specifications, key features, and craftsmanship..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs resize-none focus:outline-hidden focus:border-brand-primary custom-scrollbar"
          />
        </div>
      </div>

      {/* Section 2: Multi-Currency Pricing */}
      <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-text-main flex items-center gap-1.5 font-mono uppercase">
            <DollarSign className="w-3.5 h-3.5 text-brand-primary" />
            <span>Base Storefront Pricing</span>
          </h4>
          <span className="text-[10px] font-mono text-emerald-400">
            Live FX: 1 USD = {exchangeRate} PKR
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-text-muted">
              Price (USD $) <span className="text-brand-primary">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              min="0.5"
              required
              placeholder="149.00"
              value={basePriceUSD}
              onChange={(e) => handleUSDChange(e.target.value)}
              className="w-full min-h-10 px-3 rounded-xl bg-surface-card border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-text-muted">
              Price (PKR ₨) <span className="text-brand-primary">*</span>
            </label>
            <input
              type="number"
              min="100"
              required
              placeholder="41720"
              value={basePricePKR}
              onChange={(e) => setBasePricePKR(e.target.value)}
              className="w-full min-h-10 px-3 rounded-xl bg-surface-card border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary"
            />
          </div>
        </div>
      </div>

      {/* Section 3: SKU & Warehouse Stock */}
      <div className="p-3.5 rounded-2xl bg-surface-elevated border border-border-subtle space-y-3">
        <h4 className="text-xs font-bold text-text-main flex items-center gap-1.5 font-mono uppercase">
          <Package className="w-3.5 h-3.5 text-indigo-400" />
          <span>Warehouse SKU & Stock</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-text-muted">
              Unique SKU Identifier{" "}
              <span className="text-brand-primary">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="NEX-WOOFER-742"
              value={sku}
              onChange={(e) => setSku(e.target.value.toUpperCase())}
              className="w-full min-h-10 px-3 rounded-xl bg-surface-card border border-border-main text-text-main text-xs font-mono uppercase focus:outline-hidden focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-text-muted">
              Variant Title
            </label>
            <input
              type="text"
              placeholder="e.g. Standard Edition"
              value={variantTitle}
              onChange={(e) => setVariantTitle(e.target.value)}
              className="w-full min-h-10 px-3 rounded-xl bg-surface-card border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-text-muted">
              Initial Stock <span className="text-brand-primary">*</span>
            </label>
            <input
              type="number"
              min="0"
              required
              value={initialStock}
              onChange={(e) => setInitialStock(e.target.value)}
              className="w-full min-h-10 px-3 rounded-xl bg-surface-card border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-medium text-text-muted">
              Low Stock Threshold
            </label>
            <input
              type="number"
              min="1"
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(e.target.value)}
              className="w-full min-h-10 px-3 rounded-xl bg-surface-card border border-border-main text-text-main text-xs font-mono focus:outline-hidden focus:border-brand-primary"
            />
          </div>
        </div>
      </div>

      {/* Section 4: Image Photos Dropzone */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-text-main">
          Product Photos (Max 5)
        </label>

        <div
          {...getImageProps()}
          className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
            isImageDragActive
              ? "border-brand-primary bg-brand-primary/10"
              : "border-border-main bg-surface-elevated hover:bg-surface-hover"
          }`}
        >
          <input {...getImageInputProps()} />
          <UploadCloud className="w-5 h-5 text-brand-primary" />
          <p className="text-xs text-text-main font-medium">
            {isCompressing
              ? "Compressing images..."
              : "Drag & drop photos or click to browse"}
          </p>
        </div>

        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative group w-16 h-16 rounded-xl overflow-hidden border border-border-main bg-surface-card"
              >
                <img
                  src={img.preview}
                  alt={img.name}
                  className="w-full h-full object-cover"
                />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 right-1 w-4 h-4 rounded-full bg-black/75 text-white flex items-center justify-center hover:bg-rose-500 transition-colors cursor-pointer"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Section 5: Showcase Video (Optional) */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-text-main flex items-center gap-1.5">
          <Film className="w-3.5 h-3.5 text-brand-primary" />
          <span>Product Showcase Video (Optional, max 50MB)</span>
        </label>

        {!videoFile ? (
          <div
            {...getVideoProps()}
            className={`p-4 rounded-2xl border-2 border-dashed transition-all text-center cursor-pointer flex flex-col items-center justify-center gap-1.5 ${
              isVideoDragActive
                ? "border-brand-primary bg-brand-primary/10"
                : "border-border-main bg-surface-elevated hover:bg-surface-hover"
            }`}
          >
            <input {...getVideoInputProps()} />
            <Video className="w-5 h-5 text-indigo-400" />
            <p className="text-xs text-text-main font-medium">
              Drag & drop MP4 / WebM showcase video
            </p>
            <p className="text-[10px] text-text-muted font-mono">
              Played on-demand in hero and product details (max 50MB)
            </p>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-surface-elevated border border-border-subtle flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-black relative shrink-0">
                <video
                  src={videoPreviewUrl}
                  className="w-full h-full object-cover"
                  muted
                />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-text-main truncate">
                  {videoFile.name}
                </p>
                <p className="text-[10px] font-mono text-text-muted">
                  {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={removeVideo}
              className="w-7 h-7 rounded-lg bg-surface-card hover:bg-rose-500/10 text-text-muted hover:text-rose-400 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* Section 6: Search Tags */}
      <div className="space-y-1.5">
        <label className="block text-xs font-semibold text-text-main">
          Search Tags
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Add tag (e.g. Wireless, Titanium)..."
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag(e)}
            className="flex-1 min-h-9 px-3 rounded-xl bg-surface-elevated border border-border-main text-text-main text-xs focus:outline-hidden focus:border-brand-primary"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 rounded-xl bg-surface-elevated hover:bg-surface-hover border border-border-main text-xs font-medium text-text-main flex items-center gap-1 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {tags.map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-surface-elevated border border-border-subtle text-[11px] font-mono text-text-muted"
            >
              <Tag className="w-2.5 h-2.5" />
              <span>{t}</span>
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="hover:text-rose-400 cursor-pointer ml-0.5"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="pt-3 border-t border-border-subtle flex items-center justify-end gap-2">
        <Button
          type="button"
          variant="ghost"
          size="md"
          onClick={onClose}
          disabled={isLoading || isUploadingVideo}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          variant="luxury"
          size="md"
          icon={CheckCircle2}
          isLoading={isLoading || isCompressing || isUploadingVideo}
        >
          {isUploadingVideo
            ? `Uploading Video (${videoProgress}%)...`
            : "Publish Product"}
        </Button>
      </div>
    </form>
  );
}

export function ProductCreationModal({ isOpen, onClose, onSave, isLoading }) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Product"
      description="Upload product photos, optional showcase videos, and provision warehouse SKU stock."
      maxWidth="max-w-2xl"
    >
      {isOpen && (
        <ProductCreationFormContent
          onSave={onSave}
          onClose={onClose}
          isLoading={isLoading}
        />
      )}
    </Modal>
  );
}

export default ProductCreationModal;
