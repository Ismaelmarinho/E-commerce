const { createClient } = require("@supabase/supabase-js");
require("dotenv").config();

const URL = process.env.URL_API;
const KEY = process.env.API_KEY;

if(!URL || !KEY) {
    console.error('Error: Credenciais do Supabase não encontradas. Verifique se as variáveis de ambiente URL_API e API_KEY estão definidas.');
    process.exit(1);
}

const supabase = createClient(URL, KEY);

//export default supabase;
module.exports = supabase;