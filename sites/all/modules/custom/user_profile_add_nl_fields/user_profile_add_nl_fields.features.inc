<?php
/**
 * @file
 * user_profile_add_nl_fields.features.inc
 */

/**
 * Implements hook_default_profile2_type().
 */
function user_profile_add_nl_fields_default_profile2_type() {
  $items = array();
  $items['main'] = entity_import('profile2_type', '{
    "userCategory" : true,
    "userView" : true,
    "type" : "main",
    "label" : "Main profile",
    "weight" : "0",
    "data" : { "registration" : true, "use_page" : true },
    "rdf_mapping" : []
  }');
  return $items;
}
