const FormData = require('form-data');
const fetch = require('node-fetch');

const login_url = `${process.env.EXTERNAL_DOMAIN}/client_init/login?apikey=${process.env.EXTERNAL_APIKEY}`;

exports.externalLogin = async function (mobile, password) {
  const form = new FormData();
  form.append('username', mobile);
  form.append('password', password);

  try {
    const result = await fetch(login_url, {
      method: 'POST',
      body: form,
    });

    return result.json();
  } catch (error) {
    console.error('UTILS / EXTERNAL / LOGIN >> ERROR ', error);
  }
};
