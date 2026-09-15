import React, { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AppLayout from "@/layouts/app-layout";
import {
    Building2,
    Plus,
    Search,
    Edit2,
    Trash2,
    CheckCircle2,
    XCircle,
    Copy,
    Check,
    RefreshCw,
    Shield,
    Sparkles,
    Image,
    HelpCircle,
    Info,
    ExternalLink,
    X,
} from "lucide-react";
import { toast } from "sonner";

interface BankItem {
    id: string;
    code: string;
    name: string;
    va_prefix: string;
    biller_code?: string;
    bill_key_prefix?: string;
    logo_url?: string;
    badge_color: string;
    is_active: boolean;
    instruction_atm?: string;
    instruction_mbanking?: string;
    instruction_ibanking?: string;
    created_at?: string;
}

interface Props {
    banks: BankItem[];
    filters: {
        search: string;
        status: string;
    };
    stats: {
        total: number;
        active: number;
        inactive: number;
    };
}

export default function AdminBanksIndex({ banks, filters, stats }: Props) {
    const [search, setSearch] = useState(filters.search || "");
    const [selectedStatus, setSelectedStatus] = useState(
        filters.status || "all",
    );
    const [modalOpen, setModalOpen] = useState(false);
    const [editingBank, setEditingBank] = useState<BankItem | null>(null);
    const [deleteConfirmBank, setDeleteConfirmBank] = useState<BankItem | null>(
        null,
    );
    const [instructionPreviewBank, setInstructionPreviewBank] =
        useState<BankItem | null>(null);
    const [toggleLoading, setToggleLoading] = useState<string | null>(null);
    const [copied, setCopied] = useState<string | null>(null);

    // Form for Create & Edit
    const { data, setData, post, put, reset, processing, errors, clearErrors } =
        useForm({
            code: "",
            name: "",
            va_prefix: "",
            biller_code: "",
            bill_key_prefix: "",
            logo_url: "",
            badge_color: "blue",
            is_active: true,
            instruction_atm: "",
            instruction_mbanking: "",
            instruction_ibanking: "",
        });

    const openCreateModal = () => {
        setEditingBank(null);
        clearErrors();
        reset();
        setData({
            code: "",
            name: "",
            va_prefix: "",
            biller_code: "",
            bill_key_prefix: "",
            logo_url: "",
            badge_color: "blue",
            is_active: true,
            instruction_atm:
                "1. Masukkan kartu ATM dan PIN.\n2. Pilih Transfer > Virtual Account.\n3. Masukkan nomor Virtual Account.",
            instruction_mbanking:
                "1. Buka aplikasi Mobile Banking.\n2. Pilih menu Transfer > Virtual Account.\n3. Masukkan nomor Virtual Account dan selesaikan transaksi.",
            instruction_ibanking:
                "1. Login ke Internet Banking.\n2. Pilih menu Pembayaran Tagihan > Virtual Account.\n3. Masukkan nomor VA dan selesaikan pembayaran.",
        });
        setModalOpen(true);
    };

    const openEditModal = (bank: BankItem) => {
        setEditingBank(bank);
        clearErrors();
        setData({
            code: bank.code,
            name: bank.name,
            va_prefix: bank.va_prefix,
            biller_code: bank.biller_code || "",
            bill_key_prefix: bank.bill_key_prefix || "",
            logo_url: bank.logo_url || "",
            badge_color: bank.badge_color || "blue",
            is_active: bank.is_active,
            instruction_atm: bank.instruction_atm || "",
            instruction_mbanking: bank.instruction_mbanking || "",
            instruction_ibanking: bank.instruction_ibanking || "",
        });
        setModalOpen(true);
    };

    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (editingBank) {
            put(`/dashboard/admin/banks/${editingBank.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Data bank berhasil diperbarui!");
                    setModalOpen(false);
                },
                onError: () =>
                    toast.error(
                        "Gagal memperbarui data bank. Periksa isian form.",
                    ),
            });
        } else {
            post("/dashboard/admin/banks", {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success("Bank baru berhasil ditambahkan!");
                    setModalOpen(false);
                },
                onError: () =>
                    toast.error("Gagal menambahkan bank. Periksa isian form."),
            });
        }
    };

    const handleToggleActive = (bank: BankItem) => {
        setToggleLoading(bank.id);
        router.post(
            `/dashboard/admin/banks/${bank.id}/toggle`,
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Status ${bank.name} berhasil diubah.`);
                    setToggleLoading(null);
                },
                onError: () => {
                    toast.error("Gagal mengubah status bank.");
                    setToggleLoading(null);
                },
            },
        );
    };

    const handleDeleteBank = () => {
        if (!deleteConfirmBank) return;

        router.delete(`/dashboard/admin/banks/${deleteConfirmBank.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success(
                    `Bank ${deleteConfirmBank.name} berhasil dihapus.`,
                );
                setDeleteConfirmBank(null);
            },
            onError: () => {
                toast.error("Gagal menghapus bank.");
                setDeleteConfirmBank(null);
            },
        });
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            "/dashboard/admin/banks",
            {
                search,
                status: selectedStatus,
            },
            { preserveState: true },
        );
    };

    const handleStatusFilterChange = (status: string) => {
        setSelectedStatus(status);
        router.get(
            "/dashboard/admin/banks",
            {
                search,
                status,
            },
            { preserveState: true },
        );
    };

    const copyText = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        setCopied(label);
        toast.success(`${label} disalin!`);
        setTimeout(() => setCopied(null), 2000);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: "Dashboard", href: "/dashboard" },
                { title: "Administrator", href: "#" },
                { title: "Bank VA Management", href: "/dashboard/admin/banks" },
            ]}
        >
            <Head title="Manajemen Bank Virtual Account - Admin" />

            <div className="p-4 sm:p-6 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">
                {/* Page Title & Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 mb-1.5">
                            <Shield className="size-3" />
                            Admin Console
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                            Virtual Account Bank Channels
                        </h1>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
                            Kelola daftar bank perbankan Indonesia yang dapat
                            digunakan pada Snap Checkout simulator & Core API.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all cursor-pointer active:scale-98 shrink-0"
                    >
                        <Plus className="size-4" />
                        Tambah Bank Baru
                    </button>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
                                Total Bank
                            </div>
                            <div className="text-2xl font-bold font-mono text-neutral-900 dark:text-white mt-1">
                                {stats.total}
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                                Semua kanal terdaftar
                            </div>
                        </div>
                        <div className="size-11 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                            <Building2 className="size-5" />
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
                                Aktif di Simulator
                            </div>
                            <div className="text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 mt-1">
                                {stats.active}
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                                Tampil di pilihan checkout
                            </div>
                        </div>
                        <div className="size-11 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                            <CheckCircle2 className="size-5" />
                        </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-xs flex items-center justify-between">
                        <div>
                            <div className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                                Nonaktif (Disabled)
                            </div>
                            <div className="text-2xl font-bold font-mono text-neutral-500 mt-1">
                                {stats.inactive}
                            </div>
                            <div className="text-[11px] text-neutral-400 mt-0.5">
                                Disembunyikan dari simulator
                            </div>
                        </div>
                        <div className="size-11 rounded-2xl bg-neutral-100 dark:bg-neutral-800 text-neutral-500 flex items-center justify-center">
                            <XCircle className="size-5" />
                        </div>
                    </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="p-4 rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {/* Status Tabs */}
                    <div className="flex items-center gap-1.5 p-1 bg-neutral-100 dark:bg-neutral-950 rounded-xl w-full sm:w-auto">
                        {[
                            { id: "all", label: `Semua (${stats.total})` },
                            { id: "active", label: `Aktif (${stats.active})` },
                            {
                                id: "inactive",
                                label: `Nonaktif (${stats.inactive})`,
                            },
                        ].map((st) => (
                            <button
                                key={st.id}
                                type="button"
                                onClick={() => handleStatusFilterChange(st.id)}
                                className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                    selectedStatus === st.id
                                        ? "bg-white dark:bg-neutral-900 text-blue-600 dark:text-blue-400 shadow-xs"
                                        : "text-neutral-500 hover:text-neutral-900 dark:hover:text-white"
                                }`}
                            >
                                {st.label}
                            </button>
                        ))}
                    </div>

                    {/* Search Input */}
                    <form
                        onSubmit={handleSearch}
                        className="w-full sm:w-72 relative"
                    >
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-neutral-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari nama, kode, prefix..."
                            className="w-full pl-10 pr-4 py-2 rounded-xl text-xs bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:outline-hidden focus:border-blue-500"
                        />
                    </form>
                </div>

                {/* Banks Table */}
                <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden shadow-xs">
                    {banks.length === 0 ? (
                        <div className="p-12 text-center text-xs text-neutral-500 dark:text-neutral-400 space-y-3">
                            <Building2 className="size-8 mx-auto text-neutral-400" />
                            <div>
                                Tidak ada bank yang cocok dengan pencarian atau
                                filter.
                            </div>
                            <button
                                type="button"
                                onClick={openCreateModal}
                                className="inline-flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                            >
                                <Plus className="size-3.5" /> Tambah Bank
                                Sekarang
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs">
                                <thead>
                                    <tr className="border-b border-neutral-200 dark:border-neutral-800 text-neutral-400 uppercase text-[10px] bg-neutral-50/50 dark:bg-neutral-950/50">
                                        <th className="py-3 px-4">
                                            Bank / Logo
                                        </th>
                                        <th className="py-3 px-4">Kode API</th>
                                        <th className="py-3 px-4">
                                            Format Nomor VA
                                        </th>
                                        <th className="py-3 px-4">Instruksi</th>
                                        <th className="py-3 px-4">Status</th>
                                        <th className="py-3 px-4 text-right">
                                            Aksi
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800/60">
                                    {banks.map((bank) => (
                                        <tr
                                            key={bank.id}
                                            className="hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40 transition-colors"
                                        >
                                            {/* Bank Name & Logo */}
                                            <td className="py-3.5 px-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="size-10 rounded-xl bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center p-1.5 overflow-hidden shrink-0">
                                                        {bank.logo_url ? (
                                                            <img
                                                                src={
                                                                    bank.logo_url
                                                                }
                                                                alt={bank.name}
                                                                className="size-full object-contain"
                                                                onError={(
                                                                    e,
                                                                ) => {
                                                                    // Fallback if image fails to load
                                                                    (
                                                                        e.target as HTMLElement
                                                                    ).style.display =
                                                                        "none";
                                                                }}
                                                            />
                                                        ) : (
                                                            <Building2 className="size-5 text-neutral-400" />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-neutral-900 dark:text-white">
                                                            {bank.name}
                                                        </div>
                                                        <div className="text-[10px] font-mono text-neutral-400">
                                                            ID:{" "}
                                                            {bank.id.substring(
                                                                0,
                                                                8,
                                                            )}
                                                            ...
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Bank Code */}
                                            <td className="py-3.5 px-4">
                                                <code className="px-2 py-1 rounded-md font-mono font-bold bg-neutral-100 dark:bg-neutral-800 text-neutral-800 dark:text-neutral-200 uppercase">
                                                    {bank.code}
                                                </code>
                                            </td>

                                            {/* VA Prefix / Biller */}
                                            <td className="py-3.5 px-4 font-mono">
                                                {bank.biller_code ? (
                                                    <div className="space-y-0.5">
                                                        <div className="text-amber-600 dark:text-amber-400 font-semibold">
                                                            Biller:{" "}
                                                            {bank.biller_code}
                                                        </div>
                                                        <div className="text-[10px] text-neutral-400">
                                                            Bill Key Prefix:{" "}
                                                            {bank.bill_key_prefix ||
                                                                "99"}
                                                            ...
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div>
                                                        <span className="text-blue-600 dark:text-blue-400 font-semibold">
                                                            {bank.va_prefix}
                                                        </span>
                                                        <span className="text-neutral-400">
                                                            XXXXXXXX
                                                        </span>
                                                    </div>
                                                )}
                                            </td>

                                            {/* Instructions View */}
                                            <td className="py-3.5 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setInstructionPreviewBank(
                                                            bank,
                                                        )
                                                    }
                                                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                                >
                                                    <Info className="size-3.5" />
                                                    Lihat Panduan
                                                </button>
                                            </td>

                                            {/* Active Toggle Switch */}
                                            <td className="py-3.5 px-4">
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleToggleActive(bank)
                                                    }
                                                    disabled={
                                                        toggleLoading ===
                                                        bank.id
                                                    }
                                                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                                                        bank.is_active
                                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                                                            : "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 hover:bg-neutral-200"
                                                    }`}
                                                >
                                                    {toggleLoading ===
                                                    bank.id ? (
                                                        <RefreshCw className="size-3 animate-spin" />
                                                    ) : bank.is_active ? (
                                                        <CheckCircle2 className="size-3" />
                                                    ) : (
                                                        <XCircle className="size-3" />
                                                    )}
                                                    <span>
                                                        {bank.is_active
                                                            ? "Aktif"
                                                            : "Nonaktif"}
                                                    </span>
                                                </button>
                                            </td>

                                            {/* Actions */}
                                            <td className="py-3.5 px-4 text-right">
                                                <div className="flex items-center justify-end gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            openEditModal(bank)
                                                        }
                                                        className="p-1.5 rounded-lg text-neutral-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                                        title="Edit Bank"
                                                    >
                                                        <Edit2 className="size-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setDeleteConfirmBank(
                                                                bank,
                                                            )
                                                        }
                                                        className="p-1.5 rounded-lg text-neutral-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-neutral-800 transition-colors cursor-pointer"
                                                        title="Hapus Bank"
                                                    >
                                                        <Trash2 className="size-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Create / Edit Bank */}
            {modalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
                    <div className="w-full max-w-xl rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-5 my-8">
                        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-4">
                            <div className="flex items-center gap-2.5">
                                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                    <Building2 className="size-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                        {editingBank
                                            ? "Edit Konfigurasi Bank"
                                            : "Tambah Bank Virtual Account Baru"}
                                    </h3>
                                    <p className="text-[11px] text-neutral-500">
                                        Atur kode bank, nomor prefix VA, logo,
                                        dan petunjuk pembayaran simulator.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={handleFormSubmit}
                            className="space-y-4 text-xs"
                        >
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Bank Code */}
                                <div>
                                    <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                        Kode Bank (Slug){" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.code}
                                        onChange={(e) =>
                                            setData(
                                                "code",
                                                e.target.value
                                                    .toLowerCase()
                                                    .replace(
                                                        /[^a-z0-9_-]/g,
                                                        "",
                                                    ),
                                            )
                                        }
                                        placeholder="cth. bca, jago, seabank"
                                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono focus:border-blue-500"
                                    />
                                    {errors.code && (
                                        <div className="text-rose-500 text-[10px] mt-1">
                                            {errors.code}
                                        </div>
                                    )}
                                </div>

                                {/* Bank Name */}
                                <div>
                                    <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                        Nama Lengkap Bank{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.name}
                                        onChange={(e) =>
                                            setData("name", e.target.value)
                                        }
                                        placeholder="cth. Bank Jago Syariah"
                                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-blue-500"
                                    />
                                    {errors.name && (
                                        <div className="text-rose-500 text-[10px] mt-1">
                                            {errors.name}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* VA Prefix */}
                                <div>
                                    <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                        Prefix Nomor VA{" "}
                                        <span className="text-rose-500">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={data.va_prefix}
                                        onChange={(e) =>
                                            setData(
                                                "va_prefix",
                                                e.target.value.replace(
                                                    /\D/g,
                                                    "",
                                                ),
                                            )
                                        }
                                        placeholder="cth. 70014 / 8808"
                                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 font-mono focus:border-blue-500"
                                    />
                                    <span className="text-[10px] text-neutral-400">
                                        Digit awal nomor Virtual Account yang
                                        di-generate.
                                    </span>
                                </div>

                                {/* Logo URL */}
                                <div>
                                    <label className="font-semibold text-neutral-700 dark:text-neutral-300 block mb-1">
                                        URL Logo Bank (SVG / PNG)
                                    </label>
                                    <input
                                        type="url"
                                        value={data.logo_url}
                                        onChange={(e) =>
                                            setData("logo_url", e.target.value)
                                        }
                                        placeholder="https://.../logo.svg"
                                        className="w-full px-3 py-2 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800 focus:border-blue-500"
                                    />
                                    {data.logo_url && (
                                        <div className="mt-1.5 flex items-center gap-2 text-[10px] text-neutral-400">
                                            <span>Preview:</span>
                                            <img
                                                src={data.logo_url}
                                                alt="Preview"
                                                className="h-5 max-w-20 object-contain border p-0.5 rounded bg-white"
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Mandiri Bill Payment Special Fields */}
                            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 space-y-2">
                                <div className="font-bold text-amber-600 dark:text-amber-400 text-[11px]">
                                    Opsi Khusus: Mandiri / Multi Payment
                                    (Opsional)
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                                            Biller Code (Kode Perusahaan)
                                        </label>
                                        <input
                                            type="text"
                                            value={data.biller_code}
                                            onChange={(e) =>
                                                setData(
                                                    "biller_code",
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        "",
                                                    ),
                                                )
                                            }
                                            placeholder="cth. 70012"
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[11px] font-semibold text-neutral-600 dark:text-neutral-400 block mb-1">
                                            Bill Key Prefix
                                        </label>
                                        <input
                                            type="text"
                                            value={data.bill_key_prefix}
                                            onChange={(e) =>
                                                setData(
                                                    "bill_key_prefix",
                                                    e.target.value.replace(
                                                        /\D/g,
                                                        "",
                                                    ),
                                                )
                                            }
                                            placeholder="cth. 99"
                                            className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 font-mono"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Instructions */}
                            <div className="space-y-2 pt-1">
                                <div className="font-semibold text-neutral-700 dark:text-neutral-300">
                                    Panduan Pembayaran (Ditampilkan di Checkout
                                    Snap):
                                </div>
                                <div>
                                    <label className="text-[11px] text-neutral-500 block mb-0.5">
                                        Panduan ATM:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.instruction_atm}
                                        onChange={(e) =>
                                            setData(
                                                "instruction_atm",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
                                    />
                                </div>
                                <div>
                                    <label className="text-[11px] text-neutral-500 block mb-0.5">
                                        Panduan Mobile Banking:
                                    </label>
                                    <textarea
                                        rows={2}
                                        value={data.instruction_mbanking}
                                        onChange={(e) =>
                                            setData(
                                                "instruction_mbanking",
                                                e.target.value,
                                            )
                                        }
                                        className="w-full px-3 py-1.5 rounded-xl bg-neutral-50 dark:bg-neutral-950 border border-neutral-200 dark:border-neutral-800"
                                    />
                                </div>
                            </div>

                            {/* Active Toggle */}
                            <div className="flex items-center gap-2 pt-1">
                                <input
                                    type="checkbox"
                                    id="is_active_check"
                                    checked={data.is_active}
                                    onChange={(e) =>
                                        setData("is_active", e.target.checked)
                                    }
                                    className="size-4 rounded-md border-neutral-300 text-blue-600 focus:ring-blue-500"
                                />
                                <label
                                    htmlFor="is_active_check"
                                    className="font-semibold text-neutral-700 dark:text-neutral-300 cursor-pointer"
                                >
                                    Aktifkan bank ini di simulator checkout
                                </label>
                            </div>

                            {/* Submit & Cancel Buttons */}
                            <div className="flex items-center justify-end gap-2 pt-4 border-t border-neutral-200 dark:border-neutral-800">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 font-semibold cursor-pointer"
                                >
                                    Batal
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 shadow-md shadow-blue-600/20 cursor-pointer disabled:opacity-50"
                                >
                                    {processing && (
                                        <RefreshCw className="size-3.5 animate-spin" />
                                    )}
                                    {editingBank
                                        ? "Simpan Perubahan"
                                        : "Tambah Bank"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Instruction Preview Modal */}
            {instructionPreviewBank && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
                            <div className="flex items-center gap-2">
                                <Building2 className="size-4 text-blue-500" />
                                <h3 className="font-bold text-sm text-neutral-900 dark:text-white">
                                    Petunjuk Pembayaran:{" "}
                                    {instructionPreviewBank.name}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setInstructionPreviewBank(null)}
                                className="p-1 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-400"
                            >
                                <X className="size-4" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs text-neutral-600 dark:text-neutral-400">
                            <div>
                                <div className="font-bold text-neutral-900 dark:text-white mb-1">
                                    ATM:
                                </div>
                                <pre className="font-sans whitespace-pre-wrap p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border text-[11px] leading-relaxed">
                                    {instructionPreviewBank.instruction_atm ||
                                        "Petunjuk ATM standar."}
                                </pre>
                            </div>
                            <div>
                                <div className="font-bold text-neutral-900 dark:text-white mb-1">
                                    Mobile Banking:
                                </div>
                                <pre className="font-sans whitespace-pre-wrap p-2.5 rounded-lg bg-neutral-50 dark:bg-neutral-950 border text-[11px] leading-relaxed">
                                    {instructionPreviewBank.instruction_mbanking ||
                                        "Petunjuk Mobile Banking standar."}
                                </pre>
                            </div>
                        </div>

                        <div className="pt-2 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setInstructionPreviewBank(null)}
                                className="px-4 py-1.5 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirmBank && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
                    <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 p-6 shadow-2xl space-y-4 text-center">
                        <div className="size-12 rounded-full bg-rose-500/10 text-rose-600 mx-auto flex items-center justify-center">
                            <Trash2 className="size-6" />
                        </div>
                        <div>
                            <h3 className="text-base font-bold text-neutral-900 dark:text-white">
                                Hapus Bank {deleteConfirmBank.name}?
                            </h3>
                            <p className="text-xs text-neutral-500 mt-1">
                                Bank ini akan dinonaktifkan dan dihapus dari
                                pilihan simulator Snap Checkout.
                            </p>
                        </div>
                        <div className="flex items-center justify-center gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setDeleteConfirmBank(null)}
                                className="px-4 py-2 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-xs font-semibold cursor-pointer"
                            >
                                Batal
                            </button>
                            <button
                                type="button"
                                onClick={handleDeleteBank}
                                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-md shadow-rose-600/20 cursor-pointer"
                            >
                                Ya, Hapus Bank
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
