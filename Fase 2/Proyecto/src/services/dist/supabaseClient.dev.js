"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.supabase = void 0;

var _supabaseJs = require("@supabase/supabase-js");

var SUPABASE_URL = 'https://uilnpkauvsyvbcgazhiw.supabase.co';
var SUPABASE_ANON_KEY = 'sb_publishable_2g8qQQpVR1m1lsRjQe2XUw_p9j-AkP0';
var supabase = (0, _supabaseJs.createClient)(SUPABASE_URL, SUPABASE_ANON_KEY);
exports.supabase = supabase;
//# sourceMappingURL=supabaseClient.dev.js.map
