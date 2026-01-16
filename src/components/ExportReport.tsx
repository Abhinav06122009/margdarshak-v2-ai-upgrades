// components/ExportReport.tsx
import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import 'jspdf-autotable';

interface ExportReportProps {
  userId: string;
}

const ExportReport: React.FC<ExportReportProps> = ({ userId }) => {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [exportFormat, setExportFormat] = useState<'excel' | 'pdf' | 'csv'>('excel');

  // Fetch attendance data with course details
  const fetchAttendanceData = async () => {
    const { data, error } = await supabase
      .from('attendance')
      .select(`
        *,
        courses:course_id (
          course_name,
          course_code,
          credits
        )
      `)
      .eq('user_id', userId)
      .gte('date', dateRange.startDate || '2025-01-01')
      .lte('date', dateRange.endDate || '2025-12-31')
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  };

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setLoading(true);
      const data = await fetchAttendanceData();

      const worksheetData = data.map(record => ({
        'Date': new Date(record.date).toLocaleDateString(),
        'Course Name': record.courses?.course_name || 'Unknown',
        'Course Code': record.courses?.course_code || 'N/A',
        'Status': record.status,
        'Notes': record.notes || '',
        'Marked At': record.marked_at ? new Date(record.marked_at).toLocaleString() : '',
        'Credits': record.courses?.credits || 0
      }));

      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance Report');

      // Auto-resize columns
      const colWidths = Object.keys(worksheetData[0] || {}).map(key => ({
        wch: Math.max(key.length, 15)
      }));
      worksheet['!cols'] = colWidths;

      XLSX.writeFile(workbook, `attendance_report_${new Date().toISOString().split('T')[0]}.xlsx`);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export to PDF
  const exportToPDF = async () => {
    try {
      setLoading(true);
      const data = await fetchAttendanceData();

      const pdf = new jsPDF();
      
      // Add title
      pdf.setFontSize(20);
      pdf.text('Attendance Report', 20, 20);
      
      // Add date range
      pdf.setFontSize(12);
      pdf.text(`Period: ${dateRange.startDate || 'All'} to ${dateRange.endDate || 'All'}`, 20, 35);
      
      // Prepare table data
      const tableData = data.map(record => [
        new Date(record.date).toLocaleDateString(),
        record.courses?.course_name || 'Unknown',
        record.courses?.course_code || 'N/A',
        record.status,
        record.notes || '',
        record.courses?.credits || 0
      ]);

      // Add table
      autoTable(pdf, {
        head: [['Date', 'Course Name', 'Code', 'Status', 'Notes', 'Credits']],
        body: tableData,
        startY: 45,
        styles: { fontSize: 8 },
        headStyles: { fillColor: [66, 139, 202] }
      });

      pdf.save(`attendance_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('PDF export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export to CSV
  const exportToCSV = async () => {
    try {
      setLoading(true);
      const data = await fetchAttendanceData();

      const csvContent = [
        ['Date', 'Course Name', 'Course Code', 'Status', 'Notes', 'Credits'].join(','),
        ...data.map(record => [
          new Date(record.date).toLocaleDateString(),
          `"${record.courses?.course_name || 'Unknown'}"`,
          record.courses?.course_code || 'N/A',
          record.status,
          `"${record.notes || ''}"`,
          record.courses?.credits || 0
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `attendance_report_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('CSV export failed:', error);
      alert('CSV export failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    switch (exportFormat) {
      case 'excel':
        exportToExcel();
        break;
      case 'pdf':
        exportToPDF();
        break;
      case 'csv':
        exportToCSV();
        break;
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="text-2xl">📊</div>
        <h2 className="text-xl font-bold text-gray-800">Export Attendance Report</h2>
      </div>

      {/* Date Range Selection */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date</label>
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">End Date</label>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:border-blue-500 focus:outline-none"
          />
        </div>
      </div>

      {/* Export Format Selection */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">Export Format</label>
        <div className="flex gap-3">
          {(['excel', 'pdf', 'csv'] as const).map(format => (
            <button
              key={format}
              onClick={() => setExportFormat(format)}
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                exportFormat === format
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Export Button */}
      <button
        onClick={handleExport}
        disabled={loading}
        className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-3 rounded-xl font-semibold
                 hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg
                 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Generating Report...
          </div>
        ) : (
          `📥 Export as ${exportFormat.toUpperCase()}`
        )}
      </button>
    </div>
  );
};

export default ExportReport;
