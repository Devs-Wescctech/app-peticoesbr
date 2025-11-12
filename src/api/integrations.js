import { uploadFile } from './client.js';

export const Core = {
  UploadFile: async ({ file }) => {
    const result = await uploadFile(file);
    return { file_url: result.url };
  },
};

export const UploadFile = Core.UploadFile;

export const InvokeLLM = async () => {
  throw new Error('InvokeLLM not implemented - use external LLM service');
};

export const SendEmail = async () => {
  throw new Error('SendEmail not implemented - use external email service');
};

export const GenerateImage = async () => {
  throw new Error('GenerateImage not implemented - use external image service');
};

export const ExtractDataFromUploadedFile = async () => {
  throw new Error('ExtractDataFromUploadedFile not implemented');
};

export const CreateFileSignedUrl = async () => {
  throw new Error('CreateFileSignedUrl not implemented');
};

export const UploadPrivateFile = async () => {
  throw new Error('UploadPrivateFile not implemented - use UploadFile instead');
};






