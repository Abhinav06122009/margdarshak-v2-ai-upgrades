import React, { useRef, useState } from 'react';

const FileUploadButton: React.FC = () => {
  // Create a ref for the hidden file input element
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State to store information about the selected file(s)
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [uploadMessage, setUploadMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Function to trigger the hidden file input click
  const handleButtonClick = () => {
    fileInputRef.current?.click(); // Programmatically click the input
  };

  // Function to handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newFiles = Array.from(files); // Convert FileList to Array
      setSelectedFiles(newFiles);
      setUploadMessage(''); // Clear previous messages

      // You can immediately trigger an upload here, or wait for another button click
      // For this example, we'll add a separate "Upload" button for clarity.
      console.log('Selected file(s):', newFiles.map(file => file.name));
    } else {
      setSelectedFiles([]);
      setUploadMessage('No file selected.');
    }
  };

  // Function to simulate file upload (replace with actual API call)
  const handleUploadFiles = async () => {
    if (selectedFiles.length === 0) {
      setUploadMessage('Please select files first.');
      return;
    }

    setIsLoading(true);
    setUploadMessage('Uploading...');

    try {
      // --- Simulate an API call for each file ---
      const uploadPromises = selectedFiles.map(async (file) => {
        // In a real application, you would send this 'file' object
        // to your backend server using fetch, Axios, or a dedicated SDK.
        // Example:
        // const formData = new FormData();
        // formData.append('file', file);
        // formData.append('fileName', file.name); // Add extra data if needed

        // const response = await fetch('/api/upload', {
        //   method: 'POST',
        //   body: formData,
        // });

        // if (!response.ok) {
        //   throw new Error(`Failed to upload ${file.name}`);
        // }
        // const result = await response.json();
        // console.log(`Successfully uploaded ${file.name}:`, result);

        // --- Simulated delay ---
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));
        console.log(`Simulated upload of: ${file.name}`);
        return { fileName: file.name, success: true };
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter(r => r.success).length;

      if (successfulUploads === selectedFiles.length) {
        setUploadMessage(`Successfully uploaded ${successfulUploads} file(s)!`);
      } else {
        setUploadMessage(`Uploaded ${successfulUploads} out of ${selectedFiles.length} file(s). Some failed.`);
      }
      setSelectedFiles([]); // Clear selected files after upload
    } catch (error) {
      console.error('Upload error:', error);
      setUploadMessage(`Upload failed: ${(error as Error).message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '500px', margin: '20px auto' }}>
      <h2>File Upload Example</h2>

      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        style={{ display: 'none' }} // Keep it hidden
        multiple // Allow multiple file selection
        // accept=".jpg,.png,.pdf" // Optional: specify accepted file types
      />

      {/* Button to trigger file selection */}
      <button
        onClick={handleButtonClick}
        style={{
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          marginRight: '10px',
        }}
      >
        {selectedFiles.length > 0 ? `Change ${selectedFiles.length} File(s)` : 'Select File(s)'}
      </button>

      {/* Display selected file names */}
      {selectedFiles.length > 0 && (
        <div style={{ marginTop: '15px' }}>
          <strong>Selected Files:</strong>
          <ul style={{ listStyleType: 'none', padding: '0' }}>
            {selectedFiles.map((file, index) => (
              <li key={index} style={{ marginBottom: '5px' }}>
                {file.name} ({file.size / 1024 / 1024 > 1 ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : `${(file.size / 1024).toFixed(2)} KB`})
                {/* Optional: Display a small preview for images */}
                {file.type.startsWith('image/') && (
                  <img
                    src={URL.createObjectURL(file)}
                    alt={file.name}
                    style={{ maxHeight: '50px', marginLeft: '10px', verticalAlign: 'middle', borderRadius: '4px' }}
                  />
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Button to actually upload (after selection) */}
      <button
        onClick={handleUploadFiles}
        disabled={selectedFiles.length === 0 || isLoading}
        style={{
          padding: '10px 20px',
          backgroundColor: selectedFiles.length === 0 || isLoading ? '#cccccc' : '#28a745',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: selectedFiles.length === 0 || isLoading ? 'not-allowed' : 'pointer',
          marginTop: '15px',
        }}
      >
        {isLoading ? 'Uploading...' : `Upload ${selectedFiles.length} File(s)`}
      </button>

      {/* Display upload message */}
      {uploadMessage && (
        <p style={{ marginTop: '15px', color: isLoading ? 'blue' : (uploadMessage.includes('Successfully') ? 'green' : 'red') }}>
          {uploadMessage}
        </p>
      )}
    </div>
  );
};

export default FileUploadButton;