import React, { useState } from 'react';
import {
  FileText,
  Plus,
  Clock,
  Calendar,
  Download,
  Trash2,
  Edit,
  X,
  CheckCircle,
  Mail,
} from 'lucide-react';

const DataExport = () => {
  // State for export options
  const [exportType, setExportType] = useState('dashboard');
  const [selectedFormat, setSelectedFormat] = useState('csv');
  const [includeOptions, setIncludeOptions] = useState({
    charts: true,
    data: true,
    annotations: true,
    metadata: false,
  });
  const [exportInProgress, setExportInProgress] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [exportError, setExportError] = useState(null);

  // State for scheduled exports
  const [scheduledExports, setScheduledExports] = useState([
    {
      id: '1',
      name: 'Weekly Sales Report',
      format: 'PDF',
      frequency: 'Every Monday at 8:00 AM',
      recipients: ['john.doe@example.com', 'marketing@example.com'],
      nextRun: '2025-05-19 08:00',
      type: 'dashboard',
    },
    {
      id: '2',
      name: 'Monthly User Activity',
      format: 'Excel',
      frequency: 'First day of month at 6:00 AM',
      recipients: ['exec@example.com', 'analytics@example.com'],
      nextRun: '2025-06-01 06:00',
      type: 'user-data',
    },
    {
      id: '3',
      name: 'Daily Error Logs',
      format: 'CSV',
      frequency: 'Daily at 11:59 PM',
      recipients: ['tech@example.com'],
      nextRun: '2025-05-17 23:59',
      type: 'system-logs',
    },
  ]);

  // State for creating/editing scheduled exports
  const [showScheduleForm, setShowScheduleForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({
    name: '',
    type: 'dashboard',
    format: 'PDF',
    frequency: 'daily',
    customFrequency: '',
    time: '08:00',
    weekday: 'monday',
    monthday: '1',
    recipients: '',
    includeCharts: true,
    includeData: true,
    includeAnnotations: true,
    includeMetadata: false,
  });

  // Export options
  const exportOptions = [
    { id: 'csv', label: 'CSV (.csv)', icon: FileText },
    { id: 'excel', label: 'Excel (.xlsx)', icon: FileText },
    { id: 'pdf', label: 'PDF Document (.pdf)', icon: FileText },
    { id: 'json', label: 'JSON (.json)', icon: FileText },
  ];

  // Export types
  const exportTypes = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'report', label: 'Report' },
    { id: 'user-data', label: 'User Activity Data' },
    { id: 'system-logs', label: 'System Logs' },
  ];

  // Frequency options
  const frequencyOptions = [
    { id: 'daily', label: 'Daily' },
    { id: 'weekly', label: 'Weekly' },
    { id: 'monthly', label: 'Monthly' },
    { id: 'custom', label: 'Custom' },
  ];

  // Weekday options
  const weekdayOptions = [
    { id: 'monday', label: 'Monday' },
    { id: 'tuesday', label: 'Tuesday' },
    { id: 'wednesday', label: 'Wednesday' },
    { id: 'thursday', label: 'Thursday' },
    { id: 'friday', label: 'Friday' },
    { id: 'saturday', label: 'Saturday' },
    { id: 'sunday', label: 'Sunday' },
  ];

  // Handle checkbox changes for inline export options
  const handleCheckboxChange = (option) => {
    setIncludeOptions((prev) => ({
      ...prev,
      [option]: !prev[option],
    }));
  };

  // Handle export now
  const handleExport = async () => {
    setExportInProgress(true);
    setExportSuccess(false);
    setExportError(null);

    try {
      // Simulate API call with delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Create export data object
      const exportData = {
        type: exportType,
        format: selectedFormat,
        includeOptions: includeOptions,
        timestamp: new Date().toISOString(),
      };

      console.log('Exporting data:', exportData);
      setExportSuccess(true);

      // Reset success message after 3 seconds
      setTimeout(() => {
        setExportSuccess(false);
      }, 3000);
    } catch (error) {
      console.error('Export failed:', error);
      setExportError('Export failed. Please try again.');
    } finally {
      setExportInProgress(false);
    }
  };

  // Generate human-readable frequency text for schedule display
  const generateFrequencyText = (schedule) => {
    if (schedule.frequency === 'daily') {
      return `Daily at ${schedule.time}`;
    } else if (schedule.frequency === 'weekly') {
      return `Every ${capitalize(schedule.weekday)} at ${schedule.time}`;
    } else if (schedule.frequency === 'monthly') {
      return `${getOrdinalSuffix(parseInt(schedule.monthday))} day of month at ${schedule.time}`;
    } else {
      return schedule.customFrequency;
    }
  };

  // Capitalize first letter helper
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Get ordinal suffix for day of month
  const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return `${day}th`;
    switch (day % 10) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  // Handle schedule form inputs
  const handleScheduleFormChange = (field, value) => {
    setScheduleForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Reset schedule form to initial
  const resetScheduleForm = () => {
    setScheduleForm({
      name: '',
      type: 'dashboard',
      format: 'PDF',
      frequency: 'daily',
      customFrequency: '',
      time: '08:00',
      weekday: 'monday',
      monthday: '1',
      recipients: '',
      includeCharts: true,
      includeData: true,
      includeAnnotations: true,
      includeMetadata: false,
    });
    setEditingSchedule(null);
    setShowScheduleForm(false);
  };

  // Add or update scheduled export
  const handleSaveSchedule = () => {
    const recipientsList = scheduleForm.recipients
      .split(',')
      .map((email) => email.trim())
      .filter((email) => email);

    // Generate next run date based on frequency
    const now = new Date();
    let nextRun = new Date();

    // Set time on nextRun
    const [hours, minutes] = scheduleForm.time.split(':');
    nextRun.setHours(parseInt(hours), parseInt(minutes), 0, 0);

    // Adjust date based on frequency
    if (scheduleForm.frequency === 'weekly') {
      const weekdays = [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday',
      ];
      const targetDay = weekdays.indexOf(scheduleForm.weekday);
      const currentDay = nextRun.getDay();
      let daysToAdd = (targetDay + 7 - currentDay) % 7;
      // If daysToAdd == 0 and nextRun < now, move to next week
      if (daysToAdd === 0 && nextRun < now) daysToAdd = 7;
      nextRun.setDate(nextRun.getDate() + daysToAdd);
    } else if (scheduleForm.frequency === 'monthly') {
      const targetDay = parseInt(scheduleForm.monthday);
      nextRun.setDate(targetDay);
      if (nextRun < now) {
        nextRun.setMonth(nextRun.getMonth() + 1);
      }
    } else if (scheduleForm.frequency === 'daily') {
      if (nextRun < now) {
        nextRun.setDate(nextRun.getDate() + 1);
      }
    }

    // Format nextRun date string
    const nextRunFormatted = `${nextRun.getFullYear()}-${String(
      nextRun.getMonth() + 1
    ).padStart(2, '0')}-${String(nextRun.getDate()).padStart(2, '0')} ${String(
      nextRun.getHours()
    ).padStart(2, '0')}:${String(nextRun.getMinutes()).padStart(2, '0')}`;

    const newSchedule = {
      id: editingSchedule ? editingSchedule : `schedule-${Date.now()}`,
      name: scheduleForm.name,
      format: scheduleForm.format,
      frequency: generateFrequencyText(scheduleForm),
      recipients: recipientsList,
      nextRun: nextRunFormatted,
      type: scheduleForm.type,
      scheduleSettings: {
        ...scheduleForm,
      },
    };

    if (editingSchedule) {
      setScheduledExports((prev) =>
        prev.map((item) => (item.id === editingSchedule ? newSchedule : item))
      );
    } else {
      setScheduledExports((prev) => [...prev, newSchedule]);
    }

    resetScheduleForm();
  };

  // Delete scheduled export
  const handleDeleteSchedule = (id) => {
    setScheduledExports((prev) => prev.filter((item) => item.id !== id));
  };

  // Edit scheduled export
  const handleEditSchedule = (schedule) => {
    setEditingSchedule(schedule.id);

    if (schedule.scheduleSettings) {
      setScheduleForm(schedule.scheduleSettings);
    } else {
      const defaultForm = {
        name: schedule.name,
        type: schedule.type || 'dashboard',
        format: schedule.format,
        frequency: 'daily',
        time: '08:00',
        weekday: 'monday',
        monthday: '1',
        recipients: schedule.recipients.join(', '),
        includeCharts: true,
        includeData: true,
        includeAnnotations: true,
        includeMetadata: false,
        customFrequency: schedule.frequency,
      };

      if (schedule.frequency.startsWith('Every') && schedule.frequency.includes('at')) {
        defaultForm.frequency = 'weekly';
        const weekday = schedule.frequency.split('Every ')[1].split(' at')[0].toLowerCase();
        defaultForm.weekday = weekday;
        defaultForm.time = schedule.frequency.split('at ')[1];
      } else if (schedule.frequency.includes('day of month')) {
        defaultForm.frequency = 'monthly';
        const day = schedule.frequency.split(' ')[0];
        defaultForm.monthday = day.replace(/st|nd|rd|th/, '');
        defaultForm.time = schedule.frequency.split('at ')[1];
      } else if (schedule.frequency.startsWith('Daily')) {
        defaultForm.frequency = 'daily';
        defaultForm.time = schedule.frequency.split('at ')[1];
      } else {
        defaultForm.frequency = 'custom';
      }

      setScheduleForm(defaultForm);
    }
    setShowScheduleForm(true);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h2 className="text-xl font-semibold text-gray-800 mb-6">Data Export</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Export Data Section */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-base font-medium text-gray-800">Export Data</h3>
            </div>
            <div className="p-6">
              {/* Export Type */}
              <div className="mb-6">
                <label
                  htmlFor="export-type"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  What would you like to export?
                </label>
                <select
                  id="export-type"
                  value={exportType}
                  onChange={(e) => setExportType(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {exportTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Include Options */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select what to include:
                </label>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <input
                      id="include-charts"
                      type="checkbox"
                      checked={includeOptions.charts}
                      onChange={() => handleCheckboxChange('charts')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="include-charts"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Charts and visualizations
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="include-data"
                      type="checkbox"
                      checked={includeOptions.data}
                      onChange={() => handleCheckboxChange('data')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="include-data"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Raw data tables
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="include-annotations"
                      type="checkbox"
                      checked={includeOptions.annotations}
                      onChange={() => handleCheckboxChange('annotations')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="include-annotations"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Notes and annotations
                    </label>
                  </div>
                  <div className="flex items-center">
                    <input
                      id="include-metadata"
                      type="checkbox"
                      checked={includeOptions.metadata}
                      onChange={() => handleCheckboxChange('metadata')}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label
                      htmlFor="include-metadata"
                      className="ml-2 text-sm text-gray-700"
                    >
                      Query metadata
                    </label>
                  </div>
                </div>
              </div>

              {/* Export Format */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Export format:
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {exportOptions.map((option) => (
                    <div
                      key={option.id}
                      className={`border rounded-md p-3 flex flex-col items-center cursor-pointer hover:bg-blue-50 hover:border-blue-500 ${
                        selectedFormat === option.id
                          ? 'bg-blue-50 border-blue-500'
                          : 'border-gray-200'
                      }`}
                      onClick={() => setSelectedFormat(option.id)}
                    >
                      <option.icon
                        className={`h-8 w-8 mb-2 ${
                          selectedFormat === option.id
                            ? 'text-blue-500'
                            : 'text-gray-400'
                        }`}
                      />
                      <span
                        className={`text-sm ${
                          selectedFormat === option.id
                            ? 'text-blue-700 font-medium'
                            : 'text-gray-700'
                        }`}
                      >
                        {option.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Success/Error Messages */}
              {exportSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Export completed successfully! Your file is ready to download.
                </div>
              )}

              {exportError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-center">
                  <X className="h-5 w-5 mr-2" />
                  {exportError}
                </div>
              )}

              {/* Export Button */}
              <div className="flex justify-end">
                <button
                  className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center ${
                    exportInProgress ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  onClick={handleExport}
                  disabled={exportInProgress}
                >
                  {exportInProgress ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      Export Now
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Scheduled Exports Section */}
        <div>
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
              <h3 className="text-base font-medium text-gray-800">
                Schedule Exports
              </h3>
              <button
                className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                onClick={() => {
                  resetScheduleForm();
                  setShowScheduleForm(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1" /> New
              </button>
            </div>
            {showScheduleForm && (
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-sm font-medium text-gray-800">
                    {editingSchedule ? 'Edit Scheduled Export' : 'New Scheduled Export'}
                  </h4>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={resetScheduleForm}
                    aria-label="Close schedule form"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="space-y-4">
                  {/* Name */}
                  <div>
                    <label
                      htmlFor="schedule-name"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Name
                    </label>
                    <input
                      id="schedule-name"
                      type="text"
                      value={scheduleForm.name}
                      onChange={(e) =>
                        handleScheduleFormChange('name', e.target.value)
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Weekly sales report"
                    />
                  </div>

                  {/* Export Type */}
                  <div>
                    <label
                      htmlFor="schedule-type"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Export Type
                    </label>
                    <select
                      id="schedule-type"
                      value={scheduleForm.type}
                      onChange={(e) =>
                        handleScheduleFormChange('type', e.target.value)
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {exportTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Format */}
                  <div>
                    <label
                      htmlFor="schedule-format"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Format
                    </label>
                    <select
                      id="schedule-format"
                      value={scheduleForm.format}
                      onChange={(e) =>
                        handleScheduleFormChange('format', e.target.value)
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="PDF">PDF</option>
                      <option value="Excel">Excel</option>
                      <option value="CSV">CSV</option>
                      <option value="JSON">JSON</option>
                    </select>
                  </div>

                  {/* Frequency */}
                  <div>
                    <label
                      htmlFor="schedule-frequency"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Frequency
                    </label>
                    <select
                      id="schedule-frequency"
                      value={scheduleForm.frequency}
                      onChange={(e) =>
                        handleScheduleFormChange('frequency', e.target.value)
                      }
                      className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {frequencyOptions.map((option) => (
                        <option key={option.id} value={option.id}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Weekly selection */}
                  {scheduleForm.frequency === 'weekly' && (
                    <div>
                      <label
                        htmlFor="schedule-weekday"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Day of week
                      </label>
                      <select
                        id="schedule-weekday"
                        value={scheduleForm.weekday}
                        onChange={(e) =>
                          handleScheduleFormChange('weekday', e.target.value)
                        }
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {weekdayOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Monthly selection */}
                  {scheduleForm.frequency === 'monthly' && (
                    <div>
                      <label
                        htmlFor="schedule-monthday"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Day of month
                      </label>
                      <select
                        id="schedule-monthday"
                        value={scheduleForm.monthday}
                        onChange={(e) =>
                          handleScheduleFormChange('monthday', e.target.value)
                        }
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Array.from({ length: 31 }, (_, i) => i + 1).map(
                          (day) => (
                            <option key={day} value={day.toString()}>
                              {day}
                            </option>
                          )
                        )}
                      </select>
                    </div>
                  )}

                  {/* Custom frequency input */}
                  {scheduleForm.frequency === 'custom' && (
                    <div>
                      <label
                        htmlFor="schedule-custom"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Custom frequency
                      </label>
                      <input
                        id="schedule-custom"
                        type="text"
                        value={scheduleForm.customFrequency}
                        onChange={(e) =>
                          handleScheduleFormChange('customFrequency', e.target.value)
                        }
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Every last Friday of the month"
                      />
                    </div>
                  )}

                  {/* Time input */}
                  {scheduleForm.frequency !== 'custom' && (
                    <div>
                      <label
                        htmlFor="schedule-time"
                        className="block text-xs font-medium text-gray-700 mb-1"
                      >
                        Time
                      </label>
                      <input
                        id="schedule-time"
                        type="time"
                        value={scheduleForm.time}
                        onChange={(e) =>
                          handleScheduleFormChange('time', e.target.value)
                        }
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  {/* Recipients */}
                  <div>
                    <label
                      htmlFor="schedule-recipients"
                      className="block text-xs font-medium text-gray-700 mb-1"
                    >
                      Recipients (comma separated)
                    </label>
                    <div className="relative">
                      <input
                        id="schedule-recipients"
                        type="text"
                        value={scheduleForm.recipients}
                        onChange={(e) =>
                          handleScheduleFormChange('recipients', e.target.value)
                        }
                        className="w-full p-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                        placeholder="email@example.com, email2@example.com"
                      />
                      <Mail className="absolute right-2 top-2 h-4 w-4 text-gray-400" />
                    </div>
                  </div>

                  {/* Include options for schedule */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-700">Include in export:</p>
                    <div className="flex items-center">
                      <input
                        id="schedule-include-charts"
                        type="checkbox"
                        checked={scheduleForm.includeCharts}
                        onChange={() =>
                          handleScheduleFormChange('includeCharts', !scheduleForm.includeCharts)
                        }
                        className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="schedule-include-charts"
                        className="ml-2 text-xs text-gray-700"
                      >
                        Charts
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="schedule-include-data"
                        type="checkbox"
                        checked={scheduleForm.includeData}
                        onChange={() =>
                          handleScheduleFormChange('includeData', !scheduleForm.includeData)
                        }
                        className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="schedule-include-data"
                        className="ml-2 text-xs text-gray-700"
                      >
                        Data tables
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="schedule-include-annotations"
                        type="checkbox"
                        checked={scheduleForm.includeAnnotations}
                        onChange={() =>
                          handleScheduleFormChange('includeAnnotations', !scheduleForm.includeAnnotations)
                        }
                        className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="schedule-include-annotations"
                        className="ml-2 text-xs text-gray-700"
                      >
                        Annotations
                      </label>
                    </div>
                    <div className="flex items-center">
                      <input
                        id="schedule-include-metadata"
                        type="checkbox"
                        checked={scheduleForm.includeMetadata}
                        onChange={() =>
                          handleScheduleFormChange('includeMetadata', !scheduleForm.includeMetadata)
                        }
                        className="h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label
                        htmlFor="schedule-include-metadata"
                        className="ml-2 text-xs text-gray-700"
                      >
                        Metadata
                      </label>
                    </div>
                  </div>

                  {/* Form buttons */}
                  <div className="pt-2 flex justify-end">
                    <button
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm mr-2"
                      onClick={resetScheduleForm}
                      type="button"
                    >
                      Cancel
                    </button>
                    <button
                      className="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={handleSaveSchedule}
                      disabled={!scheduleForm.name || !scheduleForm.recipients}
                      type="button"
                    >
                      {editingSchedule ? 'Update' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Scheduled exports list */}
            <div className="divide-y divide-gray-200">
              {scheduledExports.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  No scheduled exports. Create one to get started.
                </div>
              ) : (
                scheduledExports.map((item) => (
                  <div key={item.id} className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="text-sm font-medium text-gray-800">{item.name}</h4>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditSchedule(item)}
                          className="text-gray-500 hover:text-gray-700"
                          aria-label={`Edit ${item.name}`}
                          type="button"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSchedule(item.id)}
                          className="text-red-500 hover:text-red-700"
                          aria-label={`Delete ${item.name}`}
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3 inline-block" />
                      {item.frequency}
                    </p>
                    <p className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                      <Calendar className="h-3 w-3 inline-block" />
                      Next run: {item.nextRun}
                    </p>
                    <div className="flex flex-wrap gap-1 mb-2">
                      {item.recipients.map((recipient, i) => (
                        <span
                          key={i}
                          className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                        >
                          {recipient}
                        </span>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataExport;

