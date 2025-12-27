'use client';

import { SalesRecord } from '@/types';
import { Button } from '@/components/ui/Button';
import { FiDownload } from 'react-icons/fi';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency, formatDateTime } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';

interface ReportExportProps {
    sales: SalesRecord[];
}

export default function ReportExport({ sales }: ReportExportProps) {
    const { isOwner } = useAuth();

    // Only owners should export reports
    if (!isOwner) return null;

    const handleExportExcel = () => {
        const dataToExport = sales.map(sale => ({
            Tanggal: formatDateTime(sale.transactionDate),
            Karyawan: sale.employee?.name || 'N/A',
            Cabang: sale.branch?.name || sale.branchId,
            Produk: sale.product?.name || sale.productId,
            Jumlah: sale.quantitySold,
            Total: sale.totalPrice
        }));

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Laporan Penjualan");
        XLSX.writeFile(wb, "laporan_penjualan.xlsx");
    };

    const handleExportPDF = () => {
        const doc = new jsPDF();
        doc.text("Laporan Penjualan", 14, 16);

        const tableData = sales.map(sale => [
            formatDateTime(sale.transactionDate),
            sale.employee?.name || 'N/A',
            sale.branch?.name || sale.branchId,
            sale.product?.name || sale.productId,
            sale.quantitySold,
            formatCurrency(sale.totalPrice)
        ]);

        autoTable(doc, {
            head: [['Tanggal', 'Karyawan', 'Cabang', 'Produk', 'Jumlah', 'Total']],
            body: tableData,
            startY: 20,
        });

        doc.save("laporan_penjualan.pdf");
    };

    return (
        <div className="flex gap-2">
            <Button variant="secondary" onClick={handleExportExcel} disabled={sales.length === 0} className="bg-white border-gray-200">
                <FiDownload className="mr-2" /> Excel
            </Button>
            <Button variant="secondary" onClick={handleExportPDF} disabled={sales.length === 0} className="bg-white border-gray-200">
                <FiDownload className="mr-2" /> PDF
            </Button>
        </div>
    );
}
