export { 
  Petition, 
  Signature, 
  LinkTreePage, 
  Campaign, 
  CampaignLog, 
  MessageTemplate, 
  LinkBioPage,
  uploadFile 
} from './client.js';

export const User = {
  isAuthenticated: () => true,
  getUser: () => ({ name: 'Admin', email: 'admin@peticoes.com' }),
  login: async () => true,
  logout: async () => true,
};