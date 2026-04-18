// api.js — centralized API calls
const API = '/api';
const token = () => localStorage.getItem('dt_token');
const headers = () => ({
  'Content-Type': 'application/json',
  'Authorization': 'Bearer ' + token()
});

const api = {
  get:    url          => fetch(API + url, { headers: headers() }).then(r => r.json()),
  post:   (url, body)  => fetch(API + url, { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  put:    (url, body)  => fetch(API + url, { method: 'PUT',    headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  patch:  (url, body)  => fetch(API + url, { method: 'PATCH',  headers: headers(), body: JSON.stringify(body) }).then(r => r.json()),
  del:    url          => fetch(API + url, { method: 'DELETE', headers: headers() }).then(r => r.json()),
};
