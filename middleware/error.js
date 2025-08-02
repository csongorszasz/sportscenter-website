// nem talált oldalakra másik sablont használunk
// ez a middleware a lánc végére kerül

import { getUserInfo } from '../utility/authorization.js';

export default function handleNotFound(req, res) {
  res.status(404).render('error', {
    message: 'Valami nem stimmel a kérésével.',
    userInfo: getUserInfo(req),
  });
}
