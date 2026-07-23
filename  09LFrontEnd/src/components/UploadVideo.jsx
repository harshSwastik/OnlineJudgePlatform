import { useParams, useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import axiosClient from '../utils/axiosClient';

function UploadVideo() {
  const { problemId } = useParams();
  const navigate = useNavigate();
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState(null);
  
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
    setError,
    clearErrors
  } = useForm();
  
  const selectedFile = watch('videoFile')?.[0];

  // Upload video to Cloudinary
  const onSubmit = async (data) => {
    const file = data.videoFile[0];
    
    setUploading(true);
    setUploadProgress(0);
    clearErrors();

    try {
      // Step 1: Get upload signature from backend
      const signatureResponse = await axiosClient.get(`/video/create/${problemId}`);
      const { signature, timestamp, public_id, api_key, cloud_name, upload_url } = signatureResponse.data;

      // Step 2: Create FormData for Cloudinary upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('signature', signature);
      formData.append('timestamp', timestamp);
      formData.append('public_id', public_id);
      formData.append('api_key', api_key);

      // Step 3: Upload directly to Cloudinary
      const uploadResponse = await axios.post(upload_url, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(progress);
        },
      });

      const cloudinaryResult = uploadResponse.data;

      // Step 4: Save video metadata to backend
      const metadataResponse = await axiosClient.post('/video/save', {
        problemId: problemId,
        cloudinaryPublicId: cloudinaryResult.public_id,
        secureUrl: cloudinaryResult.secure_url,
        duration: cloudinaryResult.duration,
      });

      // metadataResponse.data.videoSolution contains the thumbnailUrl from the backend
      setUploadedVideo(metadataResponse.data.videoSolution);
      reset(); 
      
    } catch (err) {
      console.error('Upload error:', err);
      setError('root', {
        type: 'manual',
        message: err.response?.data?.message || err.response?.data?.error || 'Upload failed. Please try again.'
      });
    } finally {
      setUploading(false);
      if (!uploadedVideo) setUploadProgress(0);
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Format duration
  const formatDuration = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {/* Header with Back Button */}
      <div className="flex items-center mb-6 space-x-4">
        <button 
          onClick={() => navigate('/admin/video')} // Adjust this route to match your problem list route
          className="btn btn-sm btn-ghost"
        >
          ← Back
        </button>
        <h2 className="text-2xl font-bold">Upload Solution Video</h2>
      </div>

      <div className="card bg-base-100 shadow-xl border border-base-200">
        <div className="card-body">
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* File Input */}
            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-semibold">Choose video file</span>
              </label>
              <input
                type="file"
                accept="video/*"
                {...register('videoFile', {
                  required: 'Please select a video file',
                  validate: {
                    isVideo: (files) => {
                      if (!files || !files[0]) return 'Please select a video file';
                      const file = files[0];
                      return file.type.startsWith('video/') || 'Please select a valid video file';
                    },
                    fileSize: (files) => {
                      if (!files || !files[0]) return true;
                      const file = files[0];
                      const maxSize = 100 * 1024 * 1024; // 100MB
                      return file.size <= maxSize || 'File size must be less than 100MB';
                    }
                  }
                })}
                className={`file-input file-input-bordered w-full ${errors.videoFile ? 'file-input-error' : ''}`}
                disabled={uploading}
              />
              {errors.videoFile && (
                <label className="label">
                  <span className="label-text-alt text-error">{errors.videoFile.message}</span>
                </label>
              )}
            </div>

            {/* Selected File Info */}
            {selectedFile && !uploadedVideo && (
              <div className="bg-base-200 p-3 rounded-lg">
                <h3 className="font-bold text-sm mb-1">Selected File:</h3>
                <p className="text-sm truncate">{selectedFile.name}</p>
                <p className="text-sm text-gray-500">{formatFileSize(selectedFile.size)}</p>
              </div>
            )}

            {/* Upload Progress */}
            {uploading && (
              <div className="space-y-2 mt-4">
                <div className="flex justify-between text-sm font-medium">
                  <span>Uploading to Cloudinary...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <progress 
                  className="progress progress-primary w-full" 
                  value={uploadProgress} 
                  max="100"
                ></progress>
              </div>
            )}

            {/* Error Message */}
            {errors.root && (
              <div className="alert alert-error text-sm">
                <span>{errors.root.message}</span>
              </div>
            )}

            {/* Success Message with Thumbnail */}
            {uploadedVideo && (
              <div className="alert alert-success flex-col items-start gap-4">
                <div>
                  <h3 className="font-bold">Upload Successful!</h3>
                  <p className="text-sm mt-1">Duration: {formatDuration(uploadedVideo.duration)}</p>
                  <p className="text-sm">Uploaded: {new Date(uploadedVideo.uploadedAt).toLocaleString()}</p>
                </div>
                {/* Render the thumbnail generated by your backend */}
                {uploadedVideo.thumbnailUrl && (
                  <img 
                    src={uploadedVideo.thumbnailUrl} 
                    alt="Video Thumbnail" 
                    className="w-full rounded-md border border-success/30 shadow-sm"
                  />
                )}
              </div>
            )}

            {/* Upload Button */}
            <div className="card-actions justify-end mt-6">
              <button
                type="submit"
                disabled={uploading}
                className={`btn btn-primary w-full ${uploading ? 'loading' : ''}`}
              >
                {uploading ? 'Processing...' : 'Upload Video'}
              </button>
            </div>
          </form>
        
        </div>
      </div>
    </div>
  );
}

export default UploadVideo;