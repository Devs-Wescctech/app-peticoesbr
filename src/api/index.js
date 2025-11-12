import * as client from './client.js';

export const base44 = {
  entities: {
    Petition: client.Petition,
    Signature: client.Signature,
    LinkTreePage: client.LinkTreePage,
    Campaign: client.Campaign,
    CampaignLog: client.CampaignLog,
    MessageTemplate: client.MessageTemplate,
    LinkBioPage: client.LinkBioPage,
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => {
        const result = await client.uploadFile(file);
        return { file_url: result.url };
      },
    },
  },
};

export default client;
