<?php
/**
 * @file
 * nomination_feature.features.inc
 */

/**
 * Implements hook_node_info().
 */
function nomination_feature_node_info() {
  $items = array(
    'nomination' => array(
      'name' => t('Nomination'),
      'base' => 'node_content',
      'description' => t('Nomination form content type.'),
      'has_title' => '1',
      'title_label' => t('Title'),
      'help' => '',
    ),
  );
  return $items;
}
