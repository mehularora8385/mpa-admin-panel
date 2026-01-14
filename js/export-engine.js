/**
 * Export Engine for MPA Admin Portal
 * Handles Excel, PDF, and CSV exports
 */

class ExportEngine {
    constructor() {
        this.dateFormat = 'YYYY-MM-DD HH:mm:ss';
    }

    /**
     * Export data to Excel format
     */
    async exportToExcel(data, filename = 'export.xlsx', sheetName = 'Data') {
        try {
            // Use XLSX library if available
            if (typeof XLSX === 'undefined') {
                console.error('XLSX library not loaded');
                return false;
            }

            const worksheet = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

            // Style the header row
            const headerStyle = {
                fill: { fgColor: { rgb: 'FFD700' } },
                font: { bold: true },
                alignment: { horizontal: 'center', vertical: 'center' }
            };

            // Apply styles to header
            const range = XLSX.utils.decode_range(worksheet['!ref']);
            for (let C = range.s.c; C <= range.e.c; ++C) {
                const address = XLSX.utils.encode_col(C) + '1';
                if (!worksheet[address]) continue;
                worksheet[address].s = headerStyle;
            }

            // Auto-fit columns
            const colWidths = [];
            for (let C = range.s.c; C <= range.e.c; ++C) {
                let maxLength = 10;
                for (let R = range.s.r; R <= range.e.r; ++R) {
                    const cellAddress = XLSX.utils.encode_cell({ r: R, c: C });
                    if (worksheet[cellAddress] && worksheet[cellAddress].v) {
                        const cellLength = worksheet[cellAddress].v.toString().length;
                        if (cellLength > maxLength) {
                            maxLength = cellLength;
                        }
                    }
                }
                colWidths.push({ wch: maxLength + 2 });
            }
            worksheet['!cols'] = colWidths;

            // Write file
            XLSX.writeFile(workbook, filename);
            await apiClient.logAction('EXPORT_EXCEL', { filename, recordCount: data.length });
            return true;
        } catch (error) {
            console.error('Excel export error:', error);
            return false;
        }
    }

    /**
     * Export data to CSV format
     */
    exportToCSV(data, filename = 'export.csv') {
        try {
            if (!data || data.length === 0) {
                console.error('No data to export');
                return false;
            }

            // Get headers from first object
            const headers = Object.keys(data[0]);
            
            // Create CSV content
            let csvContent = headers.join(',') + '\n';
            
            for (const row of data) {
                const values = headers.map(header => {
                    const value = row[header];
                    // Escape quotes and wrap in quotes if contains comma
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value || '';
                });
                csvContent += values.join(',') + '\n';
            }

            // Create blob and download
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();

            apiClient.logAction('EXPORT_CSV', { filename, recordCount: data.length });
            return true;
        } catch (error) {
            console.error('CSV export error:', error);
            return false;
        }
    }

    /**
     * Export data to PDF format
     */
    async exportToPDF(data, filename = 'export.pdf', title = 'Report') {
        try {
            // Check if jsPDF is available
            if (typeof jsPDF === 'undefined') {
                console.error('jsPDF library not loaded');
                return false;
            }

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Add title
            doc.setFontSize(16);
            doc.text(title, 14, 15);

            // Add date
            doc.setFontSize(10);
            doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25);

            // Add table
            if (data && data.length > 0) {
                const headers = Object.keys(data[0]);
                const rows = data.map(item => headers.map(header => item[header]));

                doc.autoTable({
                    head: [headers],
                    body: rows,
                    startY: 35,
                    margin: { top: 10, right: 10, bottom: 10, left: 10 },
                    styles: {
                        fontSize: 9,
                        cellPadding: 3,
                        overflow: 'linebreak'
                    },
                    headStyles: {
                        fillColor: [41, 128, 185],
                        textColor: 255,
                        fontStyle: 'bold'
                    },
                    alternateRowStyles: {
                        fillColor: [240, 240, 240]
                    }
                });
            }

            // Add footer
            const pageCount = doc.internal.getPages().length;
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(
                    `Page ${i} of ${pageCount}`,
                    doc.internal.pageSize.getWidth() / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }

            // Save file
            doc.save(filename);
            await apiClient.logAction('EXPORT_PDF', { filename, recordCount: data.length });
            return true;
        } catch (error) {
            console.error('PDF export error:', error);
            return false;
        }
    }

    /**
     * Export candidates data
     */
    async exportCandidates(candidates, format = 'excel') {
        const filename = `candidates_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
        
        switch (format) {
            case 'excel':
                return this.exportToExcel(candidates, filename, 'Candidates');
            case 'csv':
                return this.exportToCSV(candidates, filename);
            case 'pdf':
                return this.exportToPDF(candidates, filename, 'Candidates Report');
            default:
                return false;
        }
    }

    /**
     * Export biometric status report
     */
    async exportBiometricReport(data, format = 'excel') {
        const filename = `biometric_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
        
        switch (format) {
            case 'excel':
                return this.exportToExcel(data, filename, 'Biometric Status');
            case 'csv':
                return this.exportToCSV(data, filename);
            case 'pdf':
                return this.exportToPDF(data, filename, 'Biometric Status Report');
            default:
                return false;
        }
    }

    /**
     * Export attendance report
     */
    async exportAttendanceReport(data, format = 'excel') {
        const filename = `attendance_report_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
        
        switch (format) {
            case 'excel':
                return this.exportToExcel(data, filename, 'Attendance');
            case 'csv':
                return this.exportToCSV(data, filename);
            case 'pdf':
                return this.exportToPDF(data, filename, 'Attendance Report');
            default:
                return false;
        }
    }

    /**
     * Export audit logs
     */
    async exportAuditLogs(logs, format = 'excel') {
        const filename = `audit_logs_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : format}`;
        
        switch (format) {
            case 'excel':
                return this.exportToExcel(logs, filename, 'Audit Logs');
            case 'csv':
                return this.exportToCSV(logs, filename);
            case 'pdf':
                return this.exportToPDF(logs, filename, 'Audit Logs Report');
            default:
                return false;
        }
    }
}

// Create global export engine instance
const exportEngine = new ExportEngine();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ExportEngine, exportEngine };
}
