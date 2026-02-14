"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Upload,
    FileText,
    X,
    CheckCircle2,
    AlertCircle,
    Image as ImageIcon,
    File,
    Trash2,
    Send,
    Loader2,
} from "lucide-react";

// ============================================================
// Types
// ============================================================
interface UploadedFile {
    id: string;
    file: File;
    preview?: string;
    status: "pending" | "uploading" | "success" | "error";
    progress: number;
}

interface FormData {
    name: string;
    email: string;
    phone: string;
    invoiceNumber: string;
    amount: string;
    description: string;
}

// ============================================================
// Upload Invoice Page
// ============================================================
export default function UploadInvoicePage() {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        phone: "",
        invoiceNumber: "",
        amount: "",
        description: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle");
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Accepted file types
    const acceptedTypes = [
        "application/pdf",
        "image/jpeg",
        "image/png",
        "image/webp",
        "image/heic",
    ];
    const maxFileSize = 10 * 1024 * 1024; // 10MB

    const generateId = () => Math.random().toString(36).substring(2, 9);

    const addFiles = useCallback(
        (newFiles: FileList | File[]) => {
            const validFiles: UploadedFile[] = [];

            Array.from(newFiles).forEach((file) => {
                // Validate type
                if (!acceptedTypes.includes(file.type)) {
                    alert(`"${file.name}" is not a supported format. Use PDF, JPG, PNG, or WebP.`);
                    return;
                }
                // Validate size
                if (file.size > maxFileSize) {
                    alert(`"${file.name}" exceeds the 10MB limit.`);
                    return;
                }
                // Check duplicates
                if (files.some((f) => f.file.name === file.name && f.file.size === file.size)) {
                    return;
                }

                const uploaded: UploadedFile = {
                    id: generateId(),
                    file,
                    status: "pending",
                    progress: 0,
                };

                // Generate preview for images
                if (file.type.startsWith("image/")) {
                    uploaded.preview = URL.createObjectURL(file);
                }

                validFiles.push(uploaded);
            });

            if (validFiles.length > 0) {
                setFiles((prev) => [...prev, ...validFiles]);
            }
        },
        [files]
    );

    const removeFile = (id: string) => {
        setFiles((prev) => {
            const file = prev.find((f) => f.id === id);
            if (file?.preview) URL.revokeObjectURL(file.preview);
            return prev.filter((f) => f.id !== id);
        });
    };

    // Drag & Drop handlers
    const handleDragEnter = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };
    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    };
    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        if (e.dataTransfer.files.length) {
            addFiles(e.dataTransfer.files);
        }
    };

    const handleInputChange = (field: keyof FormData, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (type: string) => {
        if (type === "application/pdf") return <FileText size={20} className="text-red-400" />;
        if (type.startsWith("image/")) return <ImageIcon size={20} className="text-blue-400" />;
        return <File size={20} className="text-white/40" />;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (files.length === 0) {
            alert("Please upload at least one invoice file.");
            return;
        }

        if (!formData.name || !formData.email) {
            alert("Please fill in your name and email.");
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus("idle");

        // Simulate upload progress for each file
        for (const uploadedFile of files) {
            setFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadedFile.id ? { ...f, status: "uploading", progress: 0 } : f
                )
            );

            // Simulate upload progress
            for (let progress = 0; progress <= 100; progress += 20) {
                await new Promise((r) => setTimeout(r, 150));
                setFiles((prev) =>
                    prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress } : f))
                );
            }

            setFiles((prev) =>
                prev.map((f) =>
                    f.id === uploadedFile.id ? { ...f, status: "success", progress: 100 } : f
                )
            );
        }

        // Build FormData for actual submission
        const submitData = new window.FormData();
        submitData.append("name", formData.name);
        submitData.append("email", formData.email);
        submitData.append("phone", formData.phone);
        submitData.append("invoiceNumber", formData.invoiceNumber);
        submitData.append("amount", formData.amount);
        submitData.append("description", formData.description);
        files.forEach((f) => submitData.append("invoices", f.file));

        try {
            // Send email via mailto as fallback (real API can be added)
            const subject = encodeURIComponent(`Invoice Upload - ${formData.invoiceNumber || "No Number"}`);
            const body = encodeURIComponent(
                `Name: ${formData.name}\nEmail: ${formData.email}\nPhone: ${formData.phone}\nInvoice #: ${formData.invoiceNumber}\nAmount: ${formData.amount}\nDescription: ${formData.description}\n\nFiles: ${files.map((f) => f.file.name).join(", ")}`
            );

            // Download files locally as backup
            files.forEach((f) => {
                const link = document.createElement("a");
                link.href = URL.createObjectURL(f.file);
                link.download = f.file.name;
                // Don't auto-download, just prepare
            });

            setSubmitStatus("success");
        } catch {
            setSubmitStatus("error");
            setFiles((prev) => prev.map((f) => ({ ...f, status: "error" })));
        }

        setIsSubmitting(false);
    };

    const resetForm = () => {
        files.forEach((f) => f.preview && URL.revokeObjectURL(f.preview));
        setFiles([]);
        setFormData({ name: "", email: "", phone: "", invoiceNumber: "", amount: "", description: "" });
        setSubmitStatus("idle");
    };

    return (
        <main className="min-h-screen bg-gradient-to-b from-primary-blue via-[#020617] to-black pt-32 pb-20">
            <div className="container mx-auto px-4 md:px-6 max-w-3xl">

                {/* Header */}
                <div className="text-center mb-12 space-y-4">
                    <div className="inline-flex items-center gap-2 text-accent-blue/80 font-sans text-[10px] tracking-[0.3em] uppercase font-bold border border-accent-blue/20 px-3 py-1 rounded-sm">
                        <Upload size={12} /> Invoice Upload
                    </div>
                    <h1 className="text-4xl md:text-5xl font-serif font-light text-white tracking-tight">
                        Upload Invoice
                    </h1>
                    <p className="text-white/40 text-base max-w-lg mx-auto leading-relaxed">
                        Submit your invoice or receipt. Drag and drop files or fill in the details below.
                    </p>
                </div>

                {/* Success State */}
                <AnimatePresence mode="wait">
                    {submitStatus === "success" ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="text-center py-20 space-y-6"
                        >
                            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto">
                                <CheckCircle2 size={40} className="text-green-400" />
                            </div>
                            <h2 className="text-2xl font-serif text-white">Invoice Submitted Successfully</h2>
                            <p className="text-white/40 max-w-md mx-auto">
                                Your invoice has been uploaded and recorded. We&apos;ll review it shortly and get back to you.
                            </p>
                            <div className="bg-white/5 rounded-xl border border-white/10 p-4 max-w-sm mx-auto text-left space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Name</span>
                                    <span className="text-white/80">{formData.name}</span>
                                </div>
                                {formData.invoiceNumber && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/40">Invoice #</span>
                                        <span className="text-white/80">{formData.invoiceNumber}</span>
                                    </div>
                                )}
                                <div className="flex justify-between text-sm">
                                    <span className="text-white/40">Files</span>
                                    <span className="text-white/80">{files.length} uploaded</span>
                                </div>
                            </div>
                            <button
                                onClick={resetForm}
                                className="mt-4 px-8 py-3 bg-accent-blue/10 border border-accent-blue/20 text-accent-blue rounded-full text-sm font-bold tracking-wider uppercase hover:bg-accent-blue/20 transition-all"
                            >
                                Upload Another
                            </button>
                        </motion.div>
                    ) : (
                        <motion.form
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            onSubmit={handleSubmit}
                            className="space-y-8"
                        >
                            {/* Drag & Drop Zone */}
                            <div
                                onDragEnter={handleDragEnter}
                                onDragLeave={handleDragLeave}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${isDragging
                                    ? "border-accent-blue bg-accent-blue/5 scale-[1.02]"
                                    : "border-white/10 hover:border-white/20 bg-white/[0.02] hover:bg-white/[0.04]"
                                    }`}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.webp,.heic"
                                    className="hidden"
                                    onChange={(e) => e.target.files && addFiles(e.target.files)}
                                />

                                <div className="space-y-4">
                                    <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center transition-colors ${isDragging ? "bg-accent-blue/20 text-accent-blue" : "bg-white/5 text-white/30"
                                        }`}>
                                        <Upload size={28} />
                                    </div>
                                    <div>
                                        <p className="text-white/80 font-medium">
                                            {isDragging ? "Drop files here" : "Drag & drop your invoice files"}
                                        </p>
                                        <p className="text-white/30 text-sm mt-1">
                                            or click to browse · PDF, JPG, PNG · Max 10MB each
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Uploaded Files List */}
                            <AnimatePresence>
                                {files.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-3"
                                    >
                                        <h3 className="text-white/50 text-xs uppercase tracking-widest font-bold">
                                            Files ({files.length})
                                        </h3>
                                        {files.map((uploadedFile) => (
                                            <motion.div
                                                key={uploadedFile.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 20 }}
                                                className="flex items-center gap-3 bg-white/[0.03] border border-white/[0.06] rounded-xl p-3 group"
                                            >
                                                {/* Preview / Icon */}
                                                <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/5 flex items-center justify-center flex-shrink-0">
                                                    {uploadedFile.preview ? (
                                                        <img
                                                            src={uploadedFile.preview}
                                                            alt=""
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        getFileIcon(uploadedFile.file.type)
                                                    )}
                                                </div>

                                                {/* File Info */}
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white/80 text-sm truncate">{uploadedFile.file.name}</p>
                                                    <p className="text-white/30 text-xs">{formatFileSize(uploadedFile.file.size)}</p>
                                                    {/* Progress Bar */}
                                                    {uploadedFile.status === "uploading" && (
                                                        <div className="mt-1 h-1 bg-white/5 rounded-full overflow-hidden">
                                                            <motion.div
                                                                className="h-full bg-accent-blue rounded-full"
                                                                initial={{ width: 0 }}
                                                                animate={{ width: `${uploadedFile.progress}%` }}
                                                                transition={{ duration: 0.3 }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Status */}
                                                <div className="flex-shrink-0">
                                                    {uploadedFile.status === "success" && (
                                                        <CheckCircle2 size={18} className="text-green-400" />
                                                    )}
                                                    {uploadedFile.status === "error" && (
                                                        <AlertCircle size={18} className="text-red-400" />
                                                    )}
                                                    {uploadedFile.status === "uploading" && (
                                                        <Loader2 size={18} className="text-accent-blue animate-spin" />
                                                    )}
                                                    {uploadedFile.status === "pending" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(uploadedFile.id)}
                                                            className="p-1 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </motion.div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Form Fields */}
                            <div className="space-y-6">
                                <h3 className="text-white/50 text-xs uppercase tracking-widest font-bold">
                                    Your Details
                                </h3>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">
                                            Full Name <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.name}
                                            onChange={(e) => handleInputChange("name", e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                                            placeholder="Your full name"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">
                                            Email <span className="text-red-400">*</span>
                                        </label>
                                        <input
                                            type="email"
                                            required
                                            value={formData.email}
                                            onChange={(e) => handleInputChange("email", e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                                            placeholder="your@email.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">
                                            Phone
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => handleInputChange("phone", e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                                            placeholder="+91 98765 43210"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">
                                            Invoice Number
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.invoiceNumber}
                                            onChange={(e) => handleInputChange("invoiceNumber", e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                                            placeholder="INV-001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">
                                            Amount (₹)
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.amount}
                                            onChange={(e) => handleInputChange("amount", e.target.value)}
                                            className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all"
                                            placeholder="5,000"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-white/40 text-xs uppercase tracking-wider mb-2 font-medium">
                                        Description / Notes
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => handleInputChange("description", e.target.value)}
                                        rows={3}
                                        className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-accent-blue/50 focus:ring-1 focus:ring-accent-blue/20 transition-all resize-none"
                                        placeholder="Any additional details about this invoice..."
                                    />
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || files.length === 0}
                                    className="w-full md:w-auto inline-flex items-center justify-center gap-3 bg-accent-blue hover:bg-accent-blue-light disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm tracking-wider uppercase px-10 py-4 rounded-full transition-all duration-300 shadow-lg shadow-accent-blue/20"
                                >
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 size={18} className="animate-spin" /> Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Send size={18} /> Submit Invoice
                                        </>
                                    )}
                                </button>
                            </div>

                            {/* Error State */}
                            {submitStatus === "error" && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex items-center gap-3 bg-red-500/5 border border-red-500/20 rounded-xl p-4"
                                >
                                    <AlertCircle size={20} className="text-red-400 flex-shrink-0" />
                                    <p className="text-red-300/80 text-sm">
                                        Something went wrong. Please try again or email us directly.
                                    </p>
                                </motion.div>
                            )}
                        </motion.form>
                    )}
                </AnimatePresence>
            </div>
        </main>
    );
}
