<?php

if (function_exists('mcrypt_decrypt')) {
  print 'mcrypt working fine'; 
}
else {
  print 'something went wrong finding mcrypt';
}