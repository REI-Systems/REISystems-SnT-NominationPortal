<?php

/**                                                                            
 * Implements hook_views_default_views().
 *
 * This will read all files ending in .view under the subdir views recursively. 
 */                                                                            
function nomination_ui_views_default_views() {                                    
  $files = file_scan_directory(drupal_get_path('module', 'nomination_ui'). '/views', '/\.view$/');
  $views = array();                                                            
  foreach ( $files as $absolute => $file ) {                                   
    require $absolute;                                                         
    if ( !empty($view) ) {                                                     
      $views[$file->name] = $view;                                             
    }                                                                          
  }                                                                            
  return $views;                                                               
}
