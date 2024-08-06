import admin from 'firebase-admin';

import serviceAccount from './servicesKey.json';

export const app = admin.initializeApp({
  //@ts-ignore
  credential: admin.credential.cert(serviceAccount)
});
