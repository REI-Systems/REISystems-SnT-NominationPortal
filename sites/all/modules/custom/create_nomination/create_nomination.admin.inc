<?php
//TODO: change variable names to something shorter.

/**
 * Settings form for nomination module.
 */
function create_nomination_admin_settings_form($form, &$form_state) {
  $form = array();
  
  //TODO: have a static array that holds these values.
  $nd_person = variable_get('deadline_person_of_year');
  $nd_exporter = variable_get('deadline_exporter_of_year');
  $nd_sb_recovery = variable_get('deadline_disaster_recovery');
  $nd_contributions = variable_get('deadline_disaster_recovery_contribution');
  $nd_contributions_vol = variable_get('deadline_disaster_recovery_contribution_volunteer');
  $nd_prime = variable_get('deadline_prime_contractor');
  $nd_sub = variable_get('deadline_sub_contractor');
  $nd_eisenhover = variable_get('deadline_d_eisenhower');
  $nd_graduate = variable_get('deadline_graduate_award_of_year');
  $nd_innovation = variable_get('deadline_innovation_award');
  $nd_outreach = variable_get('deadline_outreach_centers');
  $nd_womens = variable_get('deadline_center_of_excellence');

  $form['deadline_person_of_year'] = array(
    '#title' => t('Small Business Person of the Year Awards:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_person),
  );

  $form['deadline_exporter_of_year'] = array(
    '#title' => t('Small Business Exporter of the Year:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_exporter),
  );

  $form['deadline_disaster_recovery'] = array(
    '#title' => t('Phoenix Award for Small Business Disaster Recovery:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_sb_recovery),
  );

  $form['deadline_disaster_recovery_contribution'] = array(
    '#title' => t('Phoenix Award for Outstanding Contributions to Disaster Recovery, Public Official:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_contributions),
  );

  $form['deadline_disaster_recovery_contribution_volunteer'] = array(
    '#title' => t('Phoenix Award for Outstanding Contributions to Disaster Recovery, Volunteer:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_contributions_vol),
  );

  $form['deadline_prime_contractor'] = array(
    '#title' => t('Federal Procurement Award - Small Business Prime Contractor of the Year Award:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_prime),
  );

  $form['deadline_sub_contractor'] = array(
    '#title' => t('Federal Procurement Award - Small Business Subcontractor of the Year Award:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_sub),
  );

  $form['deadline_d_eisenhower'] = array(
    '#title' => t('Federal Procurement Award - Dwight D. Eisenhower Award for Excellence:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_eisenhover),
  );

  $form['deadline_graduate_award_of_year'] = array(
    '#title' => t('8(a) Graduate of the Year Award:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_graduate),
  );

  $form['deadline_innovation_award'] = array(
    '#title' => t('Small Business Development Center Excellence and Innovation Award:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_innovation),
  );

  $form['deadline_outreach_centers'] = array(
    '#title' => t('Veterans Business Outreach Centers Excellence in Service Award:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_outreach),
  );
  $form['deadline_center_of_excellence'] = array(
    '#title' => t('Women’s Business Center of Excellence Award:'),
    '#type' => 'date',
    '#default_value' => _create_nomination_admin_get_deadline_value($nd_womens),
  );

  $form['submit'] = array(
    '#type' => 'submit',
    '#value' => t('Submit'),
    '#submit' => array('create_nomination_admin_settings_form_submit'),
  );

  return $form;
}

/**
 * Validation function for nomination module settings form.
 */
function create_nomination_admin_settings_form_validate($form, &$form_state) {
  // No validation right now.
}

/**
 * Submit function for nomination module setting form.
 */
function create_nomination_admin_settings_form_submit($form, &$form_state) {
  _create_nomination_admin_save_deadline_value('deadline_person_of_year', $form_state);
  
  _create_nomination_admin_save_deadline_value('deadline_exporter_of_year', $form_state);

  _create_nomination_admin_save_deadline_value('deadline_disaster_recovery', $form_state);

  _create_nomination_admin_save_deadline_value('deadline_disaster_recovery_contribution', $form_state);

  _create_nomination_admin_save_deadline_value('deadline_disaster_recovery_contribution_volunteer', $form_state);

  _create_nomination_admin_save_deadline_value('deadline_prime_contractor', $form_state);

  _create_nomination_admin_save_deadline_value('deadline_sub_contractor', $form_state);

  _create_nomination_admin_save_deadline_value('deadline_d_eisenhower', $form_state);

  _create_nomination_admin_save_deadline_value('deadline_graduate_award_of_year', $form_state);

  _create_nomination_admin_save_deadline_value('deadline_innovation_award', $form_state);

  _create_nomination_admin_save_deadline_value('deadline_outreach_centers', $form_state);

  _create_nomination_admin_save_deadline_value('deadline_center_of_excellence', $form_state);

  cache_clear_all('nomination_admin', 'cache');
  drupal_set_message('Deadline dates have been updated.');
}

/**
 * A helper function to set default_values on nomination admin settings form.
 */
function _create_nomination_admin_get_deadline_value($date) {
  return array(
    'month' => format_date($date, 'custom', 'n'),
    'day' => format_date($date, 'custom', 'j'),
    'year' => format_date($date, 'custom', 'Y'),
  );
}

/**
 * A helper function to save deadline dates into database.
 */
function _create_nomination_admin_save_deadline_value($field_name, &$form_state) {
  if ($form_state['values'][$field_name]) {
    $exporter = $form_state['values'][$field_name];
    $month = $exporter['month'];
    $day = $exporter['day'];
    $year = $exporter['year'];
    $unixtime = mktime(0, 0, 0, $month, $day, $year);
    //TODO: check to previous value, so that we don't insert same value for no reason.
    variable_set($field_name, $unixtime);
  }
}

/**
 * Admin Form to set minimum number of files to be uploaded for each award category
 */
function _create_nomination_admin_no_of_files($form, &$form_state) {
  $form = array();

  $form['text'] = array(
    '#type' => 'markup',
    '#markup' => '<h3>Set Min No. of files for Each Award Category, to be there for respective Nominations to be Valid for Submission</h3>',
  );

  $form['a'] = array(
    '#type' => 'fieldset',
    '#title' => t('Small Business Person of the Year Awards'),
  );
  $form['a']['deadline_person_of_year_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_person_of_year_files', 1),
  );
  $form['a']['deadline_person_of_year_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_person_of_year_file_fields_titles', ''),
  );
  $form['a']['deadline_person_of_year_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_person_of_year_files_required', 1),
  );


  $form['b'] = array(
    '#type' => 'fieldset',
    '#title' => t('Small Business Exporter of the Year'),
  );
  $form['b']['deadline_exporter_of_year_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_exporter_of_year_files', 1),
  );
  $form['b']['deadline_exporter_of_year_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_exporter_of_year_file_fields_titles', ''),
  );
  $form['b']['deadline_exporter_of_year_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_exporter_of_year_files_required', 1),
  );


  $form['c'] = array(
    '#type' => 'fieldset',
    '#title' => t('Phoenix Award for Small Business Disaster Recovery'),
  );
  $form['c']['deadline_disaster_recovery_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_disaster_recovery_files', 1),
  );
  $form['c']['deadline_disaster_recovery_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_disaster_recovery_file_fields_titles', ''),
  );
  $form['c']['deadline_disaster_recovery_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_disaster_recovery_files_required', 1),
  );


  $form['d'] = array(
    '#type' => 'fieldset',
    '#title' => t('Phoenix Award for Outstanding Contributions to Disaster Recovery, Public Official'),
  );
  $form['d']['deadline_disaster_recovery_contribution_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_disaster_recovery_contribution_files', 1),
  );
  $form['d']['deadline_disaster_recovery_contribution_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_disaster_recovery_contribution_file_fields_titles', ''),
  );
  $form['d']['deadline_disaster_recovery_contribution_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_disaster_recovery_contribution_files_required', 1),
  );


  $form['l'] = array(
    '#type' => 'fieldset',
    '#title' => t('Phoenix Award for Outstanding Contributions to Disaster Recovery, Volunteer'),
  );
  $form['l']['deadline_disaster_recovery_contribution_volunteer_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_disaster_recovery_contribution_volunteer_files', 1),
  );
  $form['l']['deadline_disaster_recovery_contribution_volunteer_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_disaster_recovery_contribution_volunteer_file_fields_titles', ''),
  );
  $form['l']['deadline_disaster_recovery_contribution_volunteer_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_disaster_recovery_contribution_volunteer_files_required', 1),
  );



  $form['e'] = array(
    '#type' => 'fieldset',
    '#title' => t('Federal Procurement Award - Small Business Prime Contractor of the Year Award'),
  );
  $form['e']['deadline_prime_contractor_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_prime_contractor_files', 1),
  );
  $form['e']['deadline_prime_contractor_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_prime_contractor_file_fields_titles', ''),
  );
  $form['e']['deadline_prime_contractor_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_prime_contractor_files_required', 1),
  );


  $form['f'] = array(
    '#type' => 'fieldset',
    '#title' => t('Federal Procurement Award - Small Business Subcontractor of the Year Award'),
  );
  $form['f']['deadline_sub_contractor_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_sub_contractor_files', 1),
  );
  $form['f']['deadline_sub_contractor_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_sub_contractor_file_fields_titles', ''),
  );
  $form['f']['deadline_sub_contractor_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_sub_contractor_files_required', 1),
  );


  $form['g'] = array(
    '#type' => 'fieldset',
    '#title' => t('Federal Procurement Award - Dwight D. Eisenhower Award for Excellence'),
  );
  $form['g']['deadline_d_eisenhower_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_d_eisenhower_files', 1),
  );
  $form['g']['deadline_d_eisenhower_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_d_eisenhower_file_fields_titles', ''),
  );
  $form['g']['deadline_d_eisenhower_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_d_eisenhower_files_required', 1),
  );


  $form['h'] = array(
    '#type' => 'fieldset',
    '#title' => t('8(a) Graduate of the Year Award'),
  );
  $form['h']['deadline_graduate_award_of_year_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_graduate_award_of_year_files', 1),
  );
  $form['h']['deadline_graduate_award_of_year_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_graduate_award_of_year_file_fields_titles', ''),
  );
  $form['h']['deadline_graduate_award_of_year_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_graduate_award_of_year_files_required', 1),
  );


  $form['i'] = array(
    '#type' => 'fieldset',
    '#title' => t('Small Business Development Center Excellence and Innovation Award'),
  );
  $form['i']['deadline_innovation_award_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_innovation_award_files', 1),
  );
  $form['i']['deadline_innovation_award_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_innovation_award_file_fields_titles', ''),
  );
  $form['i']['deadline_innovation_award_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_innovation_award_files_required', 1),
  );


  $form['j'] = array(
    '#type' => 'fieldset',
    '#title' => t('Veterans Business Outreach Centers Excellence in Service Award'),
  );
  $form['j']['deadline_outreach_centers_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_outreach_centers_files', 1),
  );
  $form['j']['deadline_outreach_centers_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_outreach_centers_file_fields_titles', ''),
  );
  $form['j']['deadline_outreach_centers_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_outreach_centers_files_required', 1),
  );


  $form['k'] = array(
    '#type' => 'fieldset',
    '#title' => t('Women’s Business Center of Excellence Award'),
  );
  $form['k']['deadline_center_of_excellence_files'] = array(
    '#title' => t('Maximum Number of Files Needed:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_center_of_excellence_files', 1),
  );
  $form['k']['deadline_center_of_excellence_file_fields_titles'] = array(
    '#description' => t('Please provide comma separated list of File fields Titles for the Nomination Page.'),
    '#title' => t('Same Number of File Upload Field Titles:'),
    '#type' => 'textarea',
    '#default_value' => variable_get('deadline_center_of_excellence_file_fields_titles', ''),
  );
  $form['k']['deadline_center_of_excellence_files_required'] = array(
    '#title' => t('Number of Files Required:'),
    '#type' => 'textfield',
    '#default_value' => variable_get('deadline_center_of_excellence_files_required', 1),
  );

  $form = system_settings_form($form);
  return $form;
}

  /**
   * @param $form
   * @param $form_state
   *
   * Validation function checking for values set to at least greater than 0
   */
function _create_nomination_admin_no_of_files_validate($form, &$form_state) {
  $fields = array(
    'deadline_person_of_year_files',
    'deadline_exporter_of_year_files',
    'deadline_disaster_recovery_files',
    'deadline_disaster_recovery_contribution_files',
    'deadline_disaster_recovery_contribution_volunteer_files',
    'deadline_prime_contractor_files',
    'deadline_sub_contractor_files',
    'deadline_d_eisenhower_files',
    'deadline_graduate_award_of_year_files',
    'deadline_innovation_award_files',
    'deadline_outreach_centers_files',
    'deadline_center_of_excellence_files',
  );

  foreach ($fields as $name) {
    if (((int)$form_state['values'][$name]) < 1) {
      form_set_error($name, t('Value should be set to 1 or higher, as at least one file has to be needed for each award category submission.'));
    }
  }
}