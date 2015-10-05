//JS for nomination form.
//TODO: don't know this code too good, some functions might be obsolete.
(function ($) {
    //Drupal.behaviors.menu_assignment_better_usability = {
    //    attach: function (context, settings) {

  $(document).ready(function() {
    _dialog_init($('#dialog-text'), {});
    $('#loading-ajax').hide();
    $('#nomination-help-dialog').hide();

    var x=document.getElementById("edit-field-nomination-office-und");
    $('.form-submit').click(function() {
      x.disabled=false;
    });

    var award_initial = $('#edit-field-nomination-select-award-und').val();
    if (award_initial != '_none_') {
      x.disabled=true;
    }

    //Use this Ajax way to populate the Office Select box
    $('#edit-field-nomination-zip-und-0-value, #edit-field-nomination-select-award-und').change(function() {
      var award = $('#edit-field-nomination-select-award-und').val();
      var zip = $('#edit-field-nomination-zip-und-0-value').val();
      var zipRegex = /^\d{5}$/;

      if (award == '_none_') {
        x.disabled=false;
        $('#edit-field-nomination-office-und').val('_none_');
      }
      else if (zipRegex.test(zip)) {
        $('div.form-item-field-nomination-office-und .description').before('<div class="loading_icon"><div class="ajax-progress ajax-progress-throbber"><div class="throbber">&nbsp;</div></div></div>');
        $.ajax({
          type: 'POST',
          url: '/get_office/' + award + '/' + zip,
          dataType: 'json',
          success: officeSuccess,
          error: officeError
        });
      }
    });


    /* Change the SBA Office selection as per result. */
    function officeSuccess(data) {
      var value = data.best_choice;
      x.disabled=false;
      $('#edit-field-nomination-office-und').val(value);
      if (value != '_null_' && value != null) {
        x.disabled=true;
      }
      $(".loading_icon").remove();
      return false;
    }

    /* Show error result of nomination submission. */
    function officeError(XMLHttpRequest, textStatus, errorThrown) {
      $('.loading_icon').remove();
      return false;
    }


    var $nid = $('#edit-submit-nomination').attr('nid');
    if ($nid != 0 && $nid != undefined) {
      _nomination_show_confirmation();
      _show_dialog($nid);
    }

    $('.question-mark').bind('click', _nomination_show_help);

    // ************ Functions *************************

    /* Set node_id value and show confirmation dialog. */
    function _show_dialog(nid) { $('#dialog-text').attr('nid', nid).dialog('open'); }

    /* Show result of nomination submission. */
    function onSuccess(data) {
      _get_dialog(data.result, data.text);
      return false;
    }

    /* Show error result of nomination submission. */
    function onError(XMLHttpRequest, textStatus, errorThrown) {
      var js_error = "Processing your nomination resulted in error(s)."
                   + "Please check your application against the guidelines" 
                   + "and contact the admin of this server if the error persists.";
      _get_dialog('error', js_error);
      return false;
    }

    /* Show result of nomination submission dialog. */
    function _get_dialog(result, text) {
      $('#loading-ajax').hide();
      var $dialog_text = $('#dialog-text');
      var $img = '<div class="thanks-image"><img src="/' + Drupal.settings.create_nomination.module_path
          + '/popup_image_larger.jpg" /></div>';
// this is the old div that gives slightly bigger area in the popup window
// var $text = $img + '<div class="thanks-text">' + text  + '</div>'; 
      $text = $img + text;

      $dialog_text.html('<div id="on-"' + result + '"><div class="thanks">' 
        + $text + '</div></div>');
      
      var result_dialog_options = {
        height: 400,
        width: 500,
        buttons: {
          ' Close ': function() {
            $(this).dialog('close');
            if (result == 'success') {
              window.location = '/nominations';
            }
          }
        },
        title: result.toUpperCase()
      };

      _dialog_init($('#dialog-text'), result_dialog_options);
      $('#dialog-text').dialog('open');
    }

    /* Since I'm using same div to show different types of dialogs, need to 
     * initialize those before showing them.
     *
     * Note: not as simple as before, but gives more flexibility.
     */
    function _dialog_init(element, options) {
      var default_options = {
        bgiframe: true,
        resizable: false,
        autoOpen: false,
        height: 500,
        width: 600,
        modal: true,
        dialogClass: "modal-confirmation",
        title: 'Confirmation',
        nid: 0,
        buttons: {
          "Submit Nomination": _nomination_submit_nomination,
          "Cancel": function() {
            $(this).dialog("close");
          }
        }
      };

      for (var attribute in options) {
        default_options[attribute] = options[attribute];
      }

      element.dialog(default_options);
    }

    /* Submit Nomination function */
    function _nomination_submit_nomination() {
        /*
         * Begin - Validation when 'Submit Nomination' gets clicked, makes sure that all checkboxes have been clicked before
         * actually submitting the nomination. At the first place, it makes sure that at least one file has been uploaded.
         */

        // Getting the number of files uploaded for the nomination.
        var files_uploaded = Drupal.settings.create_nomination.files_uploaded_count;
        // If no file has been uploaded with the nomination.
        if (files_uploaded == 0) {
          if ($('#dialog-text').children('p.error_notification').length == 0) {
            $('#dialog-text').prepend("<p class='error_notification'>At least one file has to be uploaded to submit the nomination." +
                    " Please hit Cancel, then Upload all the necessary files required for submitting the nomination.</p>");
          }

          $(".ui-widget-content").scrollTop("0");
          return;
        }


        // Checking if all the checkboxes are checked or not.
        var _incomplete = false;
        $('#dialog-text input.checklist_item').each(function(){
            if ($(this).is(":checked") === false) {
                _incomplete = true;
                return false;
            }
        });

        // it is true when at least one of the checkboxes is not checked, so can't submit.
        if (_incomplete === true) {
            // we might wanna redirect to the node/edit page as well, but there is no real need of it.
            //window.location = '/node/'+nid+'/edit?submit_nomination='+nid;*/

            if ($('#dialog-text').children('p.error_notification').length == 0) {
                $('#dialog-text').prepend("<p class='error_notification'>All the checkboxes need to be checked before the Submission; if you have uploaded all the " +
                    "necessary documents for the nomination, please check all the checkboxes from the checklist and hit 'Submit Nomination'. In case, you" +
                    " haven't uploaded all the necessary documents, hit 'Cancel' and upload the required documents, and then do the Submission.</p>");
            }

            $(".ui-widget-content").scrollTop("0");
            return;
        }
        /*
         * End - Validation when 'Submit Nomination' gets clicked, makes sure that all checkboxes have been clicked before
         * actually submitting the nomination.
         */


      $.ajax({
        type: 'POST',
        url: '/submit-nid/' + $(this).attr('nid'),
        dataType: 'json',
        data: $(this).attr('nid'),
        success: onSuccess,
        error: onError
      });
      $(this).dialog("close");
      $('#loading-ajax').show();
    }

      /* Show dialog for confirmation, list of checkboxes */
      function _nomination_show_confirmation() {

          var $dialog_text = $('#dialog-text');
          var $selected_value = $('#edit-field-nomination-select-award-und').val();
          var $help_dialog_options = {
              //title: 'Nomination Checklist',
              width: 920,
              height: 600,
              open:function () {
                  $(this).closest(".ui-dialog")
                      .find(".ui-button:first") // the first button
                      .addClass("submit-button");
                  $(this).closest(".ui-dialog")
                      .find(".ui-button:last") // the first button
                      .addClass("cancel-button");
              }
              /*
               buttons: {
               ' Close ': function() {
               $(this).dialog('close');
               }
               }
               */
          };

          // this function will setup the content of the confirmation box. Will change the content of #dialog-text
          _nomination_set_confirmation_text($selected_value);
          _dialog_init($dialog_text, $help_dialog_options);
          $dialog_text.dialog('open');
          $('.ui-dialog-titlebar').remove();
          $("#dialog-text input:checkbox:visible:first").focus();
          $(".ui-widget-content").scrollTop("0");
      }


      /* Sets the content of the confirmation dialog(instead of getting the default text from .module file, that is #dialog-text's html) */
      function _nomination_set_confirmation_text(award_type) {
          var $text = '';

          var award_name = {
              'deadline_person_of_year' : 'Small Business Person of the Year Awards',
              'deadline_exporter_of_year' : 'Small Business Exporter of the Year',
              'deadline_disaster_recovery' : 'Phoenix Award for Small Business Disaster Recovery',
              'deadline_disaster_recovery_contribution' : 'Phoenix Award for Outstanding Contributions to Disaster Recovery, Public Official',
              'deadline_disaster_recovery_contribution_volunteer' : 'Phoenix Award for Outstanding Contributions to Disaster Recovery, Volunteer',
              'deadline_prime_contractor' : 'Federal Procurement Award - Small Business Prime Contractor of the Year Award',
              'deadline_sub_contractor' : 'Federal Procurement Award - Small Business Subcontractor of the Year Award',
              'deadline_d_eisenhower' : 'Federal Procurement Award - Dwight D. Eisenhower Award for Excellence',
              'deadline_graduate_award_of_year' : '8(a) Graduate of the Year Award',
              'deadline_innovation_award' : 'Small Business Development Center Excellence and Innovation Award',
              'deadline_outreach_centers' : 'Veteran Business Outreach Center Excellence in Service Award',
              'deadline_center_of_excellence' : 'Women’s Business Center of Excellence Award'
          };

          switch (award_type) {
              case 'deadline_person_of_year':
                  /*
                  $text = '<p>Incomplete nomination packages will not be considered. All evaluation/selection criteria must be specifically addressed. A complete nomination package will also include:</p>'
                      + '<ul><li>A single cover page stating -</li></ul><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominee’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address if applicable;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the award for which the nomination is being made;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominator’s name, title, place of business, business address and telephone number and e-mail address if applicable;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the type of SBA assistance received (e.g., loan, SCORE counseling, SBDC assistance,  etc.), if applicable; and</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">a one-paragraph description of the nominee’s business.</label></div>'
                      + '</span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA' +
                      ' district offices and the online nominations portal. For “team” nominations for Small Business Person' +
                      ' of the Year, a background form is required for each team member;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee; or a digital photo – at least 300 dpi; photocopies are not acceptable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Four to five additional photos of the nominee’s company and employees at work '
                      + '(official company photos may be submitted provided that the submitter has permission to '
                      + 'use them from the company and/or employees in the photo);</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A nomination letter, to include a concise statement of the qualities and performance that merit the award, not to exceed four pages;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief biography of the nominee, not to exceed one page;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A business profile, not to exceed one page;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">The nominee’s financial statement — including balance sheets, profit- and-loss statements and financial reports — not exceeding 12 pages, on 8 1/2’’ x 11’’ paper - for the calendar years 2010, 2011 and 2012;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation and other evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages. Videos will not be considered.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form, which is available through SBA district offices and through the online portal.</label></div>';
                  break;

*/
                  $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal. For “team” nominations, a background form is required for each team member;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3301, Small Business Person of the Year) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable.  For “team” nominations, a photo of each nominee or group photo is acceptable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Additional supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages). Videos will not be considered.</label></div>';
                        break;



              case 'deadline_exporter_of_year':

                  $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal. For “team” nominations, a background form is required for each team member;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3302, Small Business Exporter of the Year) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable.  For “team” nominations, a photo of each nominee or group photo is acceptable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Additional supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages). Videos will not be considered.</label></div>';
                        break;

/*
                  $text = '<ul><li>A single cover page stating -</li></ul><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominee\'s full name, title, business and home '
                      + 'addresses with telephone and fax numbers, and e-mail address if applicable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the award for which the nomination is being made;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominator\'s name, title, place of business, business '
                      + 'address and telephone number and e-mail address if applicable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the type of SBA assistance received (e.g., loan, SCORE counseling, SBDC assistance, etc.),' +
                      ' if applicable; and</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">a one-paragraph description of the nominee\'s business.</label></div></span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) which is available ' +
                      'through SBA district offices and the online nominations portal. For “team” nominations for ' +
                      'Small Business Person of the Year, a background form is required for each team member;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8" x 10" or 5" x 7" photo of the nominee; or '
                      + 'a digital photo &minus; at least 300 dpi; photocopies are not '
                      + 'acceptable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Four to five additional photos of the nominee\'s company and '
                      + 'employees at work (official company photos may be submitted '
                      + 'provided that the submitter has permission to use them from '
                      + 'the company and/or employees in the photo);</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A nomination letter, to include a concise statement of '
                      + 'the qualities and performance that merit the award, not to exceed four pages;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief biography of the nominee, not to exceed one page;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A business profile, not to exceed one page;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">The nominee\'s business financial statement &mdash; '
                      + 'including balance sheets, profit-and-loss statements and '
                      + 'financial reports &mdash; not exceeding 12 pages, on 8 1/2" '
                      + 'x 11" paper &minus; for the last three years (fiscal or calendar);</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by '
                      + 'the nominator, including news clips, letters of recommendation '
                      + 'and other evidence of the appropriateness of the nomination. '
                      + 'Supporting documentation must not exceed 10 pages. Videos will '
                      + 'not be considered.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form, which is available ' +
                      'through SBA district offices and through the online portal.</label></div>';
                      */

              case 'deadline_disaster_recovery':

                  $text = '<p>Nominations must contain the information required below. Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package includes:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal. For “team” nominations, a background form is required for each team member.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3303, Phoenix Award for Small Business Disaster Recovery) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Documentation supporting approval of the SBA disaster loan;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable.  For “team” nominations, a photo of each nominee or group photo is acceptable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">If possible, photos documenting the disaster damage and photos of the rebuilt property.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</label></div>';
                      break;

                  /*
                  $text = '<p> All evaluation/selection criteria must be specifically addressed. A complete nomination package will also include, in the following order if submitted via hard copy:</p>'
                      + '<ul><li>A single cover page stating -</li></ul><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominee’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address if applicable;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the award for which the nomination is being made;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominator’s name, title, place of business, business address and telephone number and e-mail address if applicable; and'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">a one-paragraph description of the nominee’s business.</label></div></span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district ' +
                      'offices and the online nominations portal. For “team” nominations, a background form is required for each team member;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee; or a digital photo – at least 300 dpi; photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Four to five additional photos of the nominee’s company and employees at work; official company photos may be submitted provided that '
                      + 'the submitter has permission to use them from the company and/or employees in the photo.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A nomination letter, to include a concise statement of the qualities and performance that merit the award, not exceeding four pages.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief biography of the nominee, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A business profile that must include documentation supporting approval of the SBA disaster loan.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A narrative reporting how the disaster damaged the business, how the company was able to rebuild and maintain 90 percent'
                      + ' of its pre-disaster work force after receiving the SBA disaster loan, steps taken to prevent future disaster damage (if any), photos documenting the'
                      + ' disaster damage (if possible), and photos of the rebuilt property.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation and other'
                      + ' evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form, which is available at SBA district offices ' +
                      'and through the online nominations portal.</label></div>';
                      */

              case 'deadline_disaster_recovery_contribution':

                  $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package includes:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3304, Phoenix Award for Outstanding Contributions to Disaster Recovery, Public Official) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including photos, news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</label></div>';
                      break;

                  /*
                  $text =  '<p> All evaluation/selection criteria must be specifically addressed. A complete nomination package will ' +
                      'also include, in the following order if submitted via hard copy:</p>'
                      + '<ul><li>A single cover page stating -</li></ul><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominee’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address if applicable; '
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the award for which the nomination is being made;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominator’s name, title, place of business, business address and telephone number and e-mail address if applicable; and'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">a one-paragraph description of the nominee’s business and/or professional occupation.</label></div>'
                      + '</span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) which is available through ' +
                      'SBA district offices and the online nominations portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee; or a digital photo – at least 300 dpi; photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A nomination letter, to include a concise statement of the qualities and performance that merit the award, not exceeding four pages.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief biography of the nominee, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A narrative detailing how that person responded to the needs of the community in the aftermath of the disaster, as well as a biography '
                      + 'and photo of the nominee.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including photos, news clips, letters of recommendation and '
                      + 'other evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form, attached and is available at SBA district ' +
                      'offices and through the online nominations portal.</label></div>';
                  break;
              */

              case 'deadline_disaster_recovery_contribution_volunteer':

                  $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package includes:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal,</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3305, Phoenix Award for Outstanding Contributions to Disaster Recovery, Volunteer) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including photos, news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</label></div>';
                      break;

              case 'deadline_prime_contractor':

                  $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package must include:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3306, Small Business Prime Contractor of the Year Award) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</label></div>';
                      break;

/*
                  $text = '<p> All evaluation/selection criteria must be specifically addressed. A complete nomination package will also ' +
                      'include, in the following order if submitted via hard copy:</p>'
                      + '<ul><li>A single cover page stating:</li></ul><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominee’s full name, title, business and home addresses, telephone and fax numbers, and e-mail address if applicable; '
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the award for which the nomination is being made (i.e., Small Business Prime Contractor of the Year Award);</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominator’s name, title, agency name, buying activity name, business address and telephone number, and e-mail address (if available); and</label></div> '
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">a one-paragraph description of the nominee’s business.</label></div>'
                      + '</span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) which is available through ' +
                      'SBA district offices and the online nominations portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee; or a digital photo – at least 300 dpi; photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Four to five additional photos of the nominee’s company and employees at work; official company photos may be submitted provided that the submitter has permission '
                      + 'to use them from the company and/or employees in the photo.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A nomination letter, to include a concise statement of the qualities and performance that merit the award, not to exceed four pages.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief biography of the nominee, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A business profile, to include any SBA assistance, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form and additional required forms, which are available ' +
                      'at the Government Contracting Area Office, Attn: Government Contracting Area Director.</label></div>';*/

              case 'deadline_sub_contractor':

                  $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package must include:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3307, Small Business Subcontractor of the Year Award) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</label></div>';
                      break;

                  /*
                  $text = '<p> All evaluation/selection criteria must be specifically addressed. A complete nomination package will also' +
                      ' include, in the following order if submitted via hard copy:</p>'
                      + '<ul><li>A single cover page stating:</li></ul><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominee’s full name, title, business and home addresses, telephone and fax numbers, and e-mail ' +
                      'address (if available);'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Award for which the nomination is being made (i.e., Small Business Subcontractor of the Year Award);</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominator’s name and title, prime contractor name, business address, and telephone number and e-mail ' +
                      'address (if available); and</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">a one-paragraph description of the nominee’s business.</label></div>'
                      + '</span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district' +
                      ' offices and the online nominations portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee, or a digital photo – at least 300 dpi; photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Four to five additional photos of the nominee’s company and employees at work; official company photos may be submitted provided that the submitter has permission to use them from the company'
                      + ' and/or employees in the photo.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A nomination letter, to include a concise statement of the qualities and performance that merit the award, not to exceed four pages.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief biography of the nominee, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A business profile, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence'
                      + ' of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form, and additional required forms which are available' +
                      ' at the Government Contracting Area Office, Attn: Government Contracting Area Director and through the online ' +
                      'nominations portal.</label></div>';
                  */

              case 'deadline_d_eisenhower':

                  $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package includes:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form ) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3308, Dwight D. Eisenhower Award for Excellence) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</label></div>';
                      break;

                  /*
                  $text = '<p> All evaluation/selection criteria must be specifically addressed. A complete nomination package will also ' +
                      'include, in the following order if submitted via hard copy:</p>'
                      + '<ul><li>A single cover page stating:</li></ul><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominee’s full name, title, business and home addresses, telephone and fax numbers, and e-mail address if applicable;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the award for which the nomination is being made (i.e., Dwight D. Eisenhower Award for Excellence);</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the category for which the nomination is being made under the Dwight D. Eisenhower Award for Excellence;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominator’s name and title, prime contractor name, business address and telephone number and e-mail address' +
                      ' if applicable; and</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">a one-paragraph description of the nominee’s business and/or professional occupation.</label></div>'
                      + '</span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee, or a digital photo – at least 300 dpi; photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district ' +
                      'offices and the online nominations portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Four to five additional photos of the nominee’s company and employees at work; official company photos may be submitted provided that the submitter '
                      + 'has permission to use them from the company and/or employees in the photo.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A nomination letter, to include a concise statement of the qualities and performance that merit the award, not to exceed four pages.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A detailed narrative summarizing the company’s subcontracting and supplier/program.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief biography of the nominee, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A business profile, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A five-year trend analysis, in table format.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence of the appropriateness'
                      + ' of the nomination. (Supporting documentation must not exceed 10 pages.)</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form and other required forms which are available at ' +
                      'SBA district offices and through the online nominations portal.</label></div>';
                  */

              case 'deadline_graduate_award_of_year':

                  $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed. A complete nomination package includes:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3309, 8(a) Graduate of the Year Award) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">4)	Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages). Videos will not be considered.</label></div>';
                  break;

                  /*
                  $text = '<p> All evaluation/selection criteria must be specifically addressed. A complete nomination package will also ' +
                      'include, in the following order if submitted via hard copy:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Nomination letter, to include a concise statement of the qualities and performance that merit the award, ' +
                      'not exceeding four pages.</label></div>'
                      + '<div style="margin:0"><ul style="margin-top:0"><li>A single cover page stating:</li></ul></div><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Award for which the nomination is being made (i.e., 8(a) Graduate of the Year Award);'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Nominator’s name and title, business address, home address, telephone number and e-mail address.</label></div></span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district offices and the online nominations portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee; or a digital photo – at least 300 dpi; photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Four to five additional photos of the nominee’s company and employees at work (official company photos ' +
                      'may be submitted provided that the submitter has permission to use them from the company and/or employees in the photo).</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief biography of the nominee, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A business profile, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation and other evidence of the appropriateness of the nomination.'
                      + ' Supporting documentation must not exceed 10 pages. Videos will not be considered.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form which are available at SBA district offices and through ' +
                      'the online nominations portal.</label></div>';

                  break;
                  */

              case 'deadline_innovation_award':

                  $text = '<p>Nominations must contain the information required below.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package includes:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form) for the Center director which is available through SBA district offices and the online nominations portal. The Center director may also include completed background forms for individual Center employees, as applicable;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3310, Small Business Development Center Excellence and Innovation Award) which is available through SBA district offices and the online nominations portal;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the SBDC director or a digital photo – at least 300 dpi is required; photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages. Videos will not be considered.</label></div>';
                      break;

                  /*
                  $text = '<p> All evaluation/selection criteria must be specifically addressed. A complete nomination package will also ' +
                      'include, in the following order if submitted via hard copy:</p>'
                      + '<ul><li>A single cover page stating:</li></ul><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the name of the SBDC, business addresses with telephone and fax numbers, website, and  e-mail address;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the SBDC director’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the name of the host organization;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the name of the executive director;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the award for which the nomination is being made;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominator’s name, title, place of business, business address and telephone number and e-mail address; and</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">a one-paragraph description of the SBDC’s services provided.</label></div>'
                      + '</span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Nomination letter, to include a concise statement of the qualities and performance that merit the award, not exceeding five pages'
                      + ' In addition to describing the basis for the nomination, the nomination letter should highlight an individual counselor at the SBDC who, '
                      + 'in the view of the nominator, has excelled in providing counseling, training and other program services to small businesses. '
                      + ' The nomination letter should also highlight a success story relating to a particular client business served by the SBDC.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) for the Center director which is available' +
                      ' through SBA district offices and the online nominations portal. The Center director may also include completed ' +
                      'background forms for individual Center employees, as applicable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the SBDC director; or a digital photo – at least 300 dpi; photocopies ' +
                      'are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief history of the SBDC, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A business profile, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation and'
                      + ' other evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages. Videos will not be considered.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form, which is available through SBA district offices and through the online portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Please include the chart below in the nominee’s submission.</label></div>'
                      + '<div><table border="1"><tr><td></td><td><b>Goal</b></td><td><b>Actual</b></td><td><b>% Achieved</b></td></tr>'
                      + '<tr><td><b>Long Term Counseling Clients</b></td><td></td><td></td><td></td>'
                      + '<tr><td><b>New Business Starts</b></td><td></td><td></td><td></td>'
                      + '<tr><td><b>Capital Infusion</b></td><td></td><td></td><td></td></tr>'
                      + '<tr><td><b>Client Satisfaction</b></td><td></td><td></td><td></td></tr>'
                      + '<tr><td><b>Other</b></td><td></td><td></td><td></td></tr>'
                      + '<tr><td><b>Other</b></td><td></td><td></td><td></td></tr>'
                      + '<tr><td><b>Other</b></td><td></td><td></td><td></td></tr>'
                      + '</table></div>'
                      + '<div><p class="footnote">*SBDCs may have additional goals and performance measures that can be included in the “other” categories.</p></div>';

                  break;
                  */
              case 'deadline_outreach_centers':

                  $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package must include:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form ) which is available through SBA district offices and online nominations portal;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3311, Veterans Business Outreach Center Excellence in Service Award) which is available through SBA district offices and the online nominations portal;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee’s executive director or a digital photo – at least 300 dpi is required; photocopies are not acceptable.'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">4)	Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages. Videos will not be considered.'
                      + '</label></div>';

                  /*
                  $text = '<p> All evaluation/selection criteria must be specifically addressed. A complete nomination package will also ' +
                      'include, in the following order if submitted via hard copy:</p>'
                      + '<ul><li>A single cover page stating:</li></ul><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the name of the VBOC, business addresses with telephone and fax numbers, website, and  e-mail address;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the VBOC director’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the name of the host organization;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the name of the executive director;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the award for which the nomination is being made;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominator’s name, title, place of business, business address and telephone number and e-mail address; and'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">a one-paragraph description of the VBOC’s services provided.'
                      + '</label></div>'
                      + '</span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Nomination letter, to include a concise statement of the qualities and performance that merit the award, not ' +
                      'exceeding five pages.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district ' +
                      'offices and online nominations portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominee’s executive director; or a digital photo – at least 300 dpi; ' +
                      'photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief biography of the VBOC director, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A business profile, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation and other '
                      + 'evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages. Videos will not be considered.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form, which is available through SBA district offices and through the online portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Please include the chart below in the nominee’s submission.</label></div>'
                      + '<div><table border="1"><tr><td></td><td><b>Goal</b></td><td><b>Actual</b></td><td><b>% Achieved</b></td></tr>'
                      + '<tr><td><b>Long Term Counseling Clients</b></td><td></td><td></td><td></td>'
                      + '<tr><td><b>New Business Starts</b></td><td></td><td></td><td></td>'
                      + '<tr><td><b>Capital Infusion</b></td><td></td><td></td><td></td></tr>'
                      + '<tr><td><b>Client Satisfaction</b></td><td></td><td></td><td></td></tr>'
                      + '</table></div>';
                      */
                  break;

              case 'deadline_center_of_excellence':

                  $text = '<p>Nominations must contain the information required below. Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed. A complete nomination package includes:</p>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and online nominations portal.'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed nomination form (SBA Form 3312, Women’s Business Outreach Center of the Year Form) which is available through SBA district offices and the online nominations portal;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages). Videos will not be considered.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A statement by the WBC Director that the Center is in compliance with the Notice of Award.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominated WBC’s Center Director or a digital photo – at  least 300 dpi; photocopies are not acceptable.</label></div>';

                  /*
                  $text = '<p> All evaluation/selection criteria must be specifically addressed. A complete nomination package will also include, in the following order if submitted via hard copy:</p>'
                      + '<ul><li>A single cover page stating -</li></ul><span class="right_indented">'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the name of the WBC, business addresses with telephone and fax numbers, website, and e-mail address;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the WBC director’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address;'
                      + '</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the name of the host organization; the name of the executive director;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the award for which the nomination is being made;</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">the nominator’s name, title, place of business, business address and telephone number and e-mail '
                      + 'address; and</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">a one-paragraph description of the WBC’s services provided.</label></div>'
                      + '</span>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district ' +
                      'offices and online nominations portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">An original 8” x 10” or 5” x 7” photo of the nominated WBC’s Center Director; or a digital photo – at '
                      + 'least 300 dpi; photocopies are not acceptable.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A nomination letter, to include a concise statement of the qualities and WBC performance that'
                      + ' merit the award, not exceeding five  pages.  In addition to describing the basis for the'
                      + ' nomination, the nomination letter should highlight an individual counselor at the WBC who, in'
                      + ' the view of the nominator, has excelled in providing counseling, training and other program'
                      + ' services to small businesses.  The nomination letter should also highlight a success story'
                      + ' relating to a particular client business served by the WBC.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A brief biography of the Center Director, not exceeding one page.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A business profile, not exceeding one page, including the WBC mission statement, target '
                      + 'market, and types of services offered, including any specialized programs or services.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">Any other supporting documentation deemed significant by the nominator, including'
                      + ' news clips, letters of recommendation and other evidence of the appropriateness of'
                      + 'the nomination. Supporting documentation must not exceed 10 pages. Videos will not'
                      + ' be considered.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A completed SBA Form 2137 Award Nomination Consent Form, which is available at SBA offices and through the online nominations portal.</label></div>'
                      + '<div><input class="checklist_item" type="checkbox" name="checklist_item[]"><label for="checklist_item[]">A statement by the WBC Director that the Center is in compliance with the Notice of Award.</label></div>';
*/
                  break;

              default:
                  $text = '<h3> No checklist for this award is available in the system, you can proceed and submit the nomination. Please' +
                      'inform the Site Administrator about this.</h3>';
          } // switch ends here

          var basic = '<div class="dialog_content"><div class="popup_left"><img title="checklist_popup_title" alt="Submission CheckList" ' +
              'src="/' + Drupal.settings.create_nomination.module_path +'/popup-title.jpg"/>' +
              '<span class="award_name"><label>Award:</label><p class="award_title">'+ award_name[award_type] +'</p></span>' +
              '<p class="description">Please confirm by checking the boxes below that you have uploaded each of the required documents. ' +
              '<span class="prominent_text">Once you click "Submit Nomination" you will no longer be able to edit this information.</span></p>' +
              '<span class="required_docs"><label>Required Documents:</label></span><div class="check_list">';


          /*
           * Building the text for displaying the list of file names uploaded.
           */
          var comma_separated_list_of_file_names = Drupal.settings.create_nomination.file_names;
          var files_display = '<h3 class="files_label">Your Uploaded Documents</h3>';
          if (comma_separated_list_of_file_names == '') {
              files_display = files_display + '<p>There are no files uploaded for this nomination submission. You should hit Cancel on ' +
                  'this screen and then upload all the necessary required files for the nomination to be processed properly.</p>';
          }
          else {
              files_display = files_display + '<ol>';
              var list_of_files = comma_separated_list_of_file_names.split(',');
              for (var index=0; index < list_of_files.length; index++) {
                  files_display = files_display + '<li>'+ list_of_files[index] +'</li>';
              }
              files_display = files_display + '</ol>';
          }

          // getting final piece of content merging together to be displayed in the pop up.
          var text = basic + $text + '</div></div><div class="popup_right">' + files_display +'</div></div>';

          $('#dialog-text').html(text);
      }


    /* Show dialogs with help text */
    function _nomination_show_help(event) {
      var $help_type = $(this).attr('id'),
          $selected_value = $('#edit-field-nomination-select-award-und').val(),
          $help_dialog_options = {
            title: 'Supporting Documentation Guidelines',
            width: 600,
            height: 600,
            buttons: {
              ' Close ': function() {
                $(this).dialog('close');
              }
            }
          };
      if ($help_type == 'select-award') {
          $help_dialog_options.title = 'Small Business Champion Awards';
      }
      _nomination_set_help_text($help_type, $selected_value);
      var $help_dialog = $('#nomination-help-dialog');
      _dialog_init($help_dialog, $help_dialog_options);
      $help_dialog.dialog('open');
    }

    /* Change $('#nomination-help-dialog') inner html */
    /* TOO MUCH TEXT, WHICH PROBABLY BELONGS IN DB OR A SEPERATE JS FILE */
    /* Little known fact, Satan wanted to condemn Hitler with maintaining this
       code, but decided it was too evil. */
    function _nomination_set_help_text($type, $option) {
      var $text = '';
      if ($type == 'select-award') {
        //TODO: concating this way is TOO slow in js, but I'm too lazy to use 
        //  concat() or array join.
        $text = '<h3></h3>'
          + '<ul><li>Small Business Exporter of the Year</li>'
          + '<li>Small Business Person of the Year</li>'
          + '<li>Phoenix Award Small Business Disaster Recovery</li>'
          + '<li>Phoenix Award for Outstanding Contributions to Disaster Recovery</li>'
          + '<li>Federal Procurement Award Prime Contractor</li>'
          + '<li>Federal Procurement Award Sub Contractor</li>'
          + '<li>Federal Procurement Award D Eisenhower</li>'
          + '<li>Graduate Award of the Year</li>'
          + '<li>Small Business Development Center Excellence and Innovation Award</li>'
          + '<li>Veteran Business Outreach Center Excellence in Service Award</li>'
          + '<li>Womens Business Center of Excellence Award</li>'
          + '</ul><p>SBA will make the above referenced awards to eligible small '
          + 'businesses at the district level(in multi-district states), the state '
          + 'level(from each of the 50 states, the District of Columbia, Puerto '
          + 'Rico, the US Virgin Islands and Guam), the regional level and the '
          + 'national level. The national winners will be selected from the Regional '
          + 'winners.</p>';
      }
      else if ($type == 'supporting-documentation') {
        switch ($option) {
          case 'deadline_person_of_year':
              $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal. For “team” nominations, a background form is required for each team member;</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3301, Small Business Person of the Year) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable.  For “team” nominations, a photo of each nominee or group photo is acceptable;</p>'
                  + '<p>4)	Additional supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages). Videos will not be considered.</p>';

/*
            $text = '<p>Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package will also include:</p>'
              + '1) A single cover page stating -'
              + '<ul><li>the nominee’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address if applicable;'
              + '</li>'
              + '<li>the award for which the nomination is being made;</li>'
              + '<li>the nominator’s name, title, place of business, business address and telephone number and e-mail address if applicable;'
              + '</li>'
              + '<li>the type of SBA assistance received (e.g., loan, SCORE counseling, SBDC assistance,  etc.), if applicable; and'
              + '</li>'
              + '<li>a one-paragraph description of the nominee’s business.</li>'
              + '</ul>'
              + '<p>2)	A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA' +
                ' district offices and the online nominations portal. For “team” nominations for Small Business Person' +
                ' of the Year, a background form is required for each team member;</p>'
              + '<p>3) An original 8” x 10” or 5” x 7” photo of the nominee; or a digital photo – at least 300 dpi; photocopies are not acceptable;</p>'
              + '<p>4) Four to five additional photos of the nominee’s company and employees at work '
              + '(official company photos may be submitted provided that the submitter has permission to '
              + 'use them from the company and/or employees in the photo);</p>'
              + '<p>5) A nomination letter, to include a concise statement of the qualities and performance that merit the award, not to exceed four pages;</p>'
              + '<p>6) A brief biography of the nominee, not to exceed one page;</p>'
              + '<p>7) A business profile, not to exceed one page;</p>'
              + '<p>8) The nominee’s financial statement — including balance sheets, profit- and-loss statements and financial reports — not exceeding 12 pages, on 8 1/2’’ x 11’’ paper - for the calendar years 2010, 2011 and 2012;</p>'
              + '<p>9) Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation and other evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages. Videos will not be considered.</p>'
              + '<p>10) A completed SBA Form 2137 Award Nomination Consent Form, which is available through SBA district offices and through the online portal.</p>';
              */
		    break;

		  case 'deadline_exporter_of_year':
              $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal. For “team” nominations, a background form is required for each team member;</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3302, Small Business Exporter of the Year) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable.  For “team” nominations, a photo of each nominee or group photo is acceptable;</p>'
                  + '<p>4)	Additional supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages). Videos will not be considered.</p>';

/*
			$text = '<p>1) A single cover page stating	&mdash;'
			  + '<ul><li>the nominee\'s full name, title, business and home '
			  + 'addresses with telephone and fax numbers, and e-mail address if applicable;</li>'
			  + '<li>the award for which the nomination is being made;</li>'
			  + '<li>the nominator\'s name, title, place of business, business '
			  + 'address and telephone number and e-mail address if applicable;</li>'
              + '<li>the type of SBA assistance received (e.g., loan, SCORE counseling, SBDC assistance, etc.),' +
                ' if applicable; and</li>'
			  + '<li>a one-paragraph description of the nominee\'s business.</li></ul></p>'
			  + '<p>2) A completed background form (SBA Form 3300, Award Nomination Form) which is available ' +
                'through SBA district offices and the online nominations portal. For “team” nominations for ' +
                'Small Business Person of the Year, a background form is required for each team member;</p>'
			  + '<p>3) An original 8" x 10" or 5" x 7" photo of the nominee; or '
			  + 'a digital photo &minus; at least 300 dpi; photocopies are not '
			  + 'acceptable;</p>'
			  + '<p>4) Four to five additional photos of the nominee\'s company and '
			  + 'employees at work (official company photos may be submitted '
			  + 'provided that the submitter has permission to use them from '
			  + 'the company and/or employees in the photo);</p>'
			  + '<p>5) A nomination letter, to include a concise statement of '
			  + 'the qualities and performance that merit the award, not to '
			  + 'exceed four pages;</p>'
			  + '<p>6) A brief biography of the nominee, not to exceed one page;</p>'
			  + '<p>7) A business profile, not to exceed one page;</p>'
			  + '<p>8) The nominee\'s business financial statement &mdash; '
			  + 'including balance sheets, profit-and-loss statements and '
			  + 'financial reports &mdash; not exceeding 12 pages, on 8 1/2" '
			  + 'x 11" paper &minus; for the last three years (fiscal or calendar);</p>'
			  + '<p>9) Any other supporting documentation deemed significant by '
			  + 'the nominator, including news clips, letters of recommendation '
			  + 'and other evidence of the appropriateness of the nomination. '
			  + 'Supporting documentation must not exceed 10 pages. Videos will '
			  + 'not be considered.</p>'
			  + '<p>10) A completed SBA Form 2137 Award Nomination Consent Form, which is available ' +
                'through SBA district offices and through the online portal.</p>'
			  //+ '<p>11) A description of the products exported and markets served.</p>';*/
			break;

          case 'deadline_disaster_recovery':
              $text = '<p>Nominations must contain the information required below. Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package includes:</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal. For “team” nominations, a background form is required for each team member.</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3303, Phoenix Award for Small Business Disaster Recovery) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	Documentation supporting approval of the SBA disaster loan;</p>'
                  + '<p>4)	An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable.  For “team” nominations, a photo of each nominee or group photo is acceptable;</p>'
                  + '<p>5)	If possible, photos documenting the disaster damage and photos of the rebuilt property.</p>'
                  + '<p>6)	Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</p>';
            /*
            $text = '<p>All evaluation/selection criteria must be specifically addressed. A complete ' +
                'nomination package will also include, in the following order if submitted via hard copy:</p>'
              + '1) A single cover page stating —'
              + '<ul><li>the nominee’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address if applicable;'
              + '</li>'
              + '<li>the award for which the nomination is being made;</li>'
              + '<li>the nominator’s name, title, place of business, business address and telephone number and e-mail address if applicable; and'
              + '</li>'
              + '<li>a one-paragraph description of the nominee’s business.</li>'
              + '</ul>'
              + '<p>2)	A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district ' +
                'offices and the online nominations portal. For “team” nominations, a background form is required for each team member;</p>'
              + '<p>3) An original 8” x 10” or 5” x 7” photo of the nominee; or a digital photo – at least 300 dpi; photocopies are not acceptable.</p>'
              + '<p>4) Four to five additional photos of the nominee’s company and employees at work; official company photos may be submitted provided that '
              + 'the submitter has permission to use them from the company and/or employees in the photo.</p>'
              + '<p>5) A nomination letter, to include a concise statement of the qualities and performance that merit the award, not exceeding four pages.</p>'
              + '<p>6) A brief biography of the nominee, not exceeding one page.</p>'
              + '<p>7) A business profile that must include documentation supporting approval of the SBA disaster loan.</p>'
              + '<p>8) A narrative reporting how the disaster damaged the business, how the company was able to rebuild and maintain 90 percent'
              + ' of its pre-disaster work force after receiving the SBA disaster loan, steps taken to prevent future disaster damage (if any), photos documenting the'
              + ' disaster damage (if possible), and photos of the rebuilt property.</p>'
              + '<p>9) Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation and other'
              + ' evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages.</p>'
              + '<p>10)	A completed SBA Form 2137 Award Nomination Consent Form, which is available at SBA district offices ' +
                'and through the online nominations portal.</p>';
                */
            break;

          case 'deadline_disaster_recovery_contribution':
              $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package includes:</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal.</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3304, Phoenix Award for Outstanding Contributions to Disaster Recovery, Public Official) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable;</p>'
                  + '<p>4)	Any other supporting documentation deemed significant by the nominator, including photos, news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</p>';

/*
            $text =  '<p>All evaluation/selection criteria must be specifically addressed. A complete nomination package will ' +
                'also include, in the following order if submitted via hard copy:</p>'
              + '1) A single cover page stating —'
              + '<ul><li>the nominee’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address if applicable;'
              + '</li>'
              + '<li>the award for which the nomination is being made;</li>'
              + '<li>the nominator’s name, title, place of business, business address and telephone number and e-mail address if applicable; and'
              + '</li>'
              + '<li>a one-paragraph description of the nominee’s business and/or professional occupation.</li>'
              + '</ul>'
              + '<p>2) A completed background form (SBA Form 3300, Award Nomination Form) which is available through ' +
                'SBA district offices and the online nominations portal.</p>'
              + '<p>3) An original 8” x 10” or 5” x 7” photo of the nominee; or a digital photo – at least 300 dpi; photocopies are not acceptable.</p>'
              + '<p>4) A nomination letter, to include a concise statement of the qualities and performance that merit the award, not exceeding four pages.</p>'
              + '<p>5) A brief biography of the nominee, not exceeding one page.</p>'
              + '<p>6) A narrative detailing how that person responded to the needs of the community in the aftermath of the disaster, as well as a biography '
              + 'and photo of the nominee.</p>'
              + '<p>7) Any other supporting documentation deemed significant by the nominator, including photos, news clips, letters of recommendation and '
              + 'other evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages.</p>'
              + '<p>8) A completed SBA Form 2137 Award Nomination Consent Form, attached and is available at SBA district ' +
                'offices and through the online nominations portal.</p>';*/
                 break;

            case 'deadline_disaster_recovery_contribution_volunteer':
                $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package includes:</p>'
                    + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal,</p>'
                    + '<p>2)	A completed nomination form (SBA Form 3305, Phoenix Award for Outstanding Contributions to Disaster Recovery, Volunteer) which is available through SBA district offices and the online nominations portal;</p>'
                    + '<p>3)	An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable.</p>'
                    + '<p>4)	Any other supporting documentation deemed significant by the nominator, including photos, news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</p>';
                break;


            case 'deadline_prime_contractor':
              $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package must include:</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3306, Small Business Prime Contractor of the Year Award) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable;</p>'
                  + '<p>4)	Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</p>';


            /*
            $text = '<p>All evaluation/selection criteria must be specifically addressed. A complete nomination package will also ' +
                'include, in the following order if submitted via hard copy:</p>'
              + '1) A single cover page stating:'
              + '<ul><li>the nominee’s full name, title, business and home addresses, telephone and fax numbers, and e-mail address if applicable;'
              + '</li>'
              + '<li>the award for which the nomination is being made (i.e., Small Business Prime Contractor of the Year Award);</li>'
              + '<li>the nominator’s name, title, agency name, buying activity name, business address and telephone number, and e-mail address (if available); and</li> '
              + '<li>a one-paragraph description of the nominee’s business.</li>'
              + '</ul>'
              + '<p>2) A completed background form (SBA Form 3300, Award Nomination Form) which is available through ' +
                'SBA district offices and the online nominations portal.</p>'
              + '<p>3) An original 8” x 10” or 5” x 7” photo of the nominee; or a digital photo – at least 300 dpi; photocopies are not acceptable.</p>'
              + '<p>4) Four to five additional photos of the nominee’s company and employees at work; official company photos may be submitted provided that the submitter has permission '
              + 'to use them from the company and/or employees in the photo.</p>'
              + '<p>5) A nomination letter, to include a concise statement of the qualities and performance that merit the award, not to exceed four pages.</p>'
              + '<p>6) A brief biography of the nominee, not exceeding one page.</p>'
              + '<p>7) A business profile, to include any SBA assistance, not exceeding one page.</p>'
              + '<p>8) Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages.</p>'
              + '<p>9) A completed SBA Form 2137 Award Nomination Consent Form and additional required forms, which are available ' +
                'at the Government Contracting Area Office, Attn: Government Contracting Area Director.</p>'
              */
              break;

          case 'deadline_sub_contractor':
              $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package must include:</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA offices and the online nominations portal;</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3307, Small Business Subcontractor of the Year Award) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable.</p>'
                  + '<p>4)	Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</p>';


/*
              $text = '<p>All evaluation/selection criteria must be specifically addressed. A complete nomination package will also' +
                ' include, in the following order if submitted via hard copy:</p>'
              + '1) A single cover page stating:'
              + '<ul><li>the nominee’s full name, title, business and home addresses, telephone and fax numbers, and e-mail ' +
                'address (if available);'
              + '</li>'
              + '<li>Award for which the nomination is being made (i.e., Small Business Subcontractor of the Year Award);</li>'
              + '<li>the nominator’s name and title, prime contractor name, business address, and telephone number and e-mail ' +
                'address (if available); and</li>'
              + '<li>a one-paragraph description of the nominee’s business.</li>'
              + '</ul>'
              + '<p>2) A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district' +
                ' offices and the online nominations portal.</p>'
              + '<p>3) An original 8” x 10” or 5” x 7” photo of the nominee, or a digital photo – at least 300 dpi; photocopies are not acceptable.</p>'
              + '<p>4) Four to five additional photos of the nominee’s company and employees at work; official company photos may be submitted provided that the submitter has permission to use them from the company'
              + ' and/or employees in the photo.</p>'
              + '<p>5) A nomination letter, to include a concise statement of the qualities and performance that merit the award, not to exceed four pages.</p>'
              + '<p>6) A brief biography of the nominee, not exceeding one page.</p>'
              + '<p>7) A business profile, not exceeding one page.</p>'
              + '<p>8) Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence'
              + ' of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages. </p>'
              + '<p>9) A completed SBA Form 2137 Award Nomination Consent Form, and additional required forms which are available' +
                ' at the Government Contracting Area Office, Attn: Government Contracting Area Director and through the online ' +
                'nominations portal.</p>';*/
              break;

          case 'deadline_d_eisenhower':
              $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package includes:</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form ) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3308, Dwight D. Eisenhower Award for Excellence) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable;</p>'
                  + '<p>4)	Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages).</p>';

            /*
            $text = '<p>All evaluation/selection criteria must be specifically addressed. A complete nomination package will also ' +
                'include, in the following order if submitted via hard copy:</p>'
               + '1) A single cover page stating:'
              + '<ul><li>the nominee’s full name, title, business and home addresses, telephone and fax numbers, and e-mail address if applicable;'
              + '</li>'
              + '<li>the award for which the nomination is being made (i.e., Dwight D. Eisenhower Award for Excellence);</li>'
              + '<li>the category for which the nomination is being made under the Dwight D. Eisenhower Award for Excellence;</li>'
              + '<li>the nominator’s name and title, prime contractor name, business address and telephone number and e-mail address' +
                ' if applicable; and</li>'
              +  '<li>a one-paragraph description of the nominee’s business and/or professional occupation.</li>'
              + '</ul>'
              + '<p>2) An original 8” x 10” or 5” x 7” photo of the nominee, or a digital photo – at least 300 dpi; photocopies are not acceptable.</p>'
              + '<p>3) A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district ' +
                'offices and the online nominations portal.</p>'
              + '<p>4) Four to five additional photos of the nominee’s company and employees at work; official company photos may be submitted provided that the submitter '
              + 'has permission to use them from the company and/or employees in the photo.</p>'
              + '<p>5) A nomination letter, to include a concise statement of the qualities and performance that merit the award, not to exceed four pages.</p>'
              + '<p>6) A detailed narrative summarizing the company’s subcontracting and supplier/program.</p>'
              + '<p>7) A brief biography of the nominee, not exceeding one page.</p>'
              + '<p>8) A business profile, not exceeding one page.</p>'
              + '<p>9) A five-year trend analysis, in table format.</p>'
              + '<p>10) Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, and other evidence of the appropriateness'
              + ' of the nomination. (Supporting documentation must not exceed 10 pages.)</p>'
              + '<p>11) A completed SBA Form 2137 Award Nomination Consent Form and other required forms which are available at ' +
                'SBA district offices and through the online nominations portal.</p>';*/
              break;
          case 'deadline_graduate_award_of_year':
              $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed. A complete nomination package includes:</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3309, 8(a) Graduate of the Year Award) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	An original 8” x 10” or 5” x 7” photo of the nominee or a digital photo – at least 300 dpi is required; photocopies are not acceptable;</p>'
                  + '<p>4)	Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages). Videos will not be considered.</p>';

            /*
            $text = '<p>All evaluation/selection criteria must be specifically addressed. A complete nomination package will also ' +
                'include, in the following order if submitted via hard copy:</p>'
              + '<p>1)	Nomination letter, to include a concise statement of the qualities and performance that merit the award, ' +
                'not exceeding four pages.</p>'
              + '2) A single cover page stating:'
              + '<ul><li>Award for which the nomination is being made (i.e., 8(a) Graduate of the Year Award);'
              + '</li>'
              + '<li>Nominator’s name and title, business address, home address, telephone number and e-mail address.</li></ul>'
              + '<p>3) A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district offices and the online nominations portal.</p>'
              + '<p>4) An original 8” x 10” or 5” x 7” photo of the nominee; or a digital photo – at least 300 dpi; photocopies are not acceptable.</p>'
              + '<p>5) Four to five additional photos of the nominee’s company and employees at work (official company photos ' +
                'may be submitted provided that the submitter has permission to use them from the company and/or employees in the photo).</p>'
              + '<p>6) A brief biography of the nominee, not exceeding one page.</p>'
              + '<p>7) A business profile, not exceeding one page.</p>'
              + '<p>8) Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation and other evidence of the appropriateness of the nomination.'
              + ' Supporting documentation must not exceed 10 pages. Videos will not be considered.</p>'
              + '<p>9) A completed SBA Form 2137 Award Nomination Consent Form which are available at SBA district offices and through ' +
                'the online nominations portal.</p>';*/
              break;
          case 'deadline_innovation_award':
              $text = '<p>Nominations must contain the information required below.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package includes:</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form) for the Center director which is available through SBA district offices and the online nominations portal. The Center director may also include completed background forms for individual Center employees, as applicable;</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3310, Small Business Development Center Excellence and Innovation Award) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	An original 8” x 10” or 5” x 7” photo of the SBDC director or a digital photo – at least 300 dpi is required; photocopies are not acceptable.</p>'
                  + '<p>4)	Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages. Videos will not be considered.</p>';

 /*
            $text = '<p>All evaluation/selection criteria must be specifically addressed. A complete nomination package will also ' +
                'include, in the following order if submitted via hard copy:</p>'
              + '<p>1) A single cover page stating:'
              + '<ul><li>the name of the SBDC, business addresses with telephone and fax numbers, website, and  e-mail address;'
              + '</li>'
              + '<li>the SBDC director’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address;</li>'
              + '<li>the name of the host organization;</li>'
              + '<li>the name of the executive director;</li>'
              + '<li>the award for which the nomination is being made;</li>'
              + '<li>the nominator’s name, title, place of business, business address and telephone number and e-mail address; and</li>'
              + '<li>a one-paragraph description of the SBDC’s services provided.</li>'
              + '</ul></p>'
              + '<p>2) Nomination letter, to include a concise statement of the qualities and performance that merit the award, not exceeding five pages'
              + ' In addition to describing the basis for the nomination, the nomination letter should highlight an individual counselor at the SBDC who, '
              + 'in the view of the nominator, has excelled in providing counseling, training and other program services to small businesses. '
              + ' The nomination letter should also highlight a success story relating to a particular client business served by the SBDC.</p>'
              + '<p>3) A completed background form (SBA Form 3300, Award Nomination Form) for the Center director which is available' +
                ' through SBA district offices and the online nominations portal. The Center director may also include completed ' +
                'background forms for individual Center employees, as applicable.</p>'
              + '<p>4) An original 8” x 10” or 5” x 7” photo of the SBDC director; or a digital photo – at least 300 dpi; photocopies ' +
                'are not acceptable.</p>'
              + '<p>5) A brief history of the SBDC, not exceeding one page.</p>'
              + '<p>6) A business profile, not exceeding one page.</p>'
              + '<p>7) Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation and'
              + ' other evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages. Videos will not be considered.</p>'
              + '<p>8) A completed SBA Form 2137 Award Nomination Consent Form, which is available through SBA district offices and through the online portal.</p>'
              + '<p>9) Please include the chart below in the nominee’s submission.</p>'
              + '<table border="1"><tr><td></td><td><b>Goal</b></td><td><b>Actual</b></td><td><b>% Achieved</b></td></tr>'
              + '<tr><td><b>Long Term Counseling Clients</b></td><td></td><td></td><td></td>'
              + '<tr><td><b>New Business Starts</b></td><td></td><td></td><td></td>'
              + '<tr><td><b>Capital Infusion</b></td><td></td><td></td><td></td></tr>'
              + '<tr><td><b>Client Satisfaction</b></td><td></td><td></td><td></td></tr>'
              + '<tr><td><b>Other</b></td><td></td><td></td><td></td></tr>'
              + '<tr><td><b>Other</b></td><td></td><td></td><td></td></tr>'
              + '<tr><td><b>Other</b></td><td></td><td></td><td></td></tr>'
              + '</table>'
              + '*SBDCs may have additional goals and performance measures that can be included in the “other” categories.'
              */
              break;
          case 'deadline_outreach_centers':
              $text = '<p>Nominations must contain the information required below.  Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed.  A complete nomination package must include:</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form ) which is available through SBA district offices and online nominations portal;</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3311, Veterans Business Outreach Center Excellence in Service Award) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	An original 8” x 10” or 5” x 7” photo of the nominee’s executive director or a digital photo – at least 300 dpi is required; photocopies are not acceptable.</p>'
                  + '<p>4)	Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages. Videos will not be considered.</p>';

            /*
            $text = '<p>All evaluation/selection criteria must be specifically addressed. A complete nomination package will also ' +
                'include, in the following order if submitted via hard copy:</p>'
              + '1) A single cover page stating:'
              + '<ul><li>the name of the VBOC, business addresses with telephone and fax numbers, website, and  e-mail address;'
              + '</li>'
              + '<li>the VBOC director’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address;'
              + '</li>'
              + '<li>the name of the host organization;</li>'
              + '<li>the name of the executive director;</li>'
              + '<li>the award for which the nomination is being made;</li>'
              + '<li>the nominator’s name, title, place of business, business address and telephone number and e-mail address; and</li>'
              + '<li>a one-paragraph description of the VBOC’s services provided.</li>'
              + '</ul>'
              + '<p>2) Nomination letter, to include a concise statement of the qualities and performance that merit the award, not ' +
                'exceeding five pages.</p>'
              + '<p>3) A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district ' +
                'offices and online nominations portal.</p>'
              + '<p>4) An original 8” x 10” or 5” x 7” photo of the nominee’s executive director; or a digital photo – at least 300 dpi; ' +
                'photocopies are not acceptable.</p>'
              + '<p>5) A brief biography of the VBOC director, not exceeding one page.</p>'
              + '<p>6) A business profile, not exceeding one page.</p>'
              + '<p>7) Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation and other '
              + 'evidence of the appropriateness of the nomination. Supporting documentation must not exceed 10 pages. Videos will not be considered.</p>'
              + '<p>8) A completed SBA Form 2137 Award Nomination Consent Form, which is available through SBA district offices and through the online portal.</p>'
              + '<p>9) Please include the chart below in the nominee’s submission.</p>'
              + '<table border="1"><tr><td></td><td><b>Goal</b></td><td><b>Actual</b></td><td><b>% Achieved</b></td></tr>'
              + '<tr><td><b>Long Term Counseling Clients</b></td><td></td><td></td><td></td>'
              + '<tr><td><b>New Business Starts</b></td><td></td><td></td><td></td>'
              + '<tr><td><b>Capital Infusion</b></td><td></td><td></td><td></td></tr>'
              + '<tr><td><b>Client Satisfaction</b></td><td></td><td></td><td></td></tr>'
              + '</table>'*/
            break;
          case 'deadline_center_of_excellence':
              $text = '<p>Nominations must contain the information required below. Incomplete nomination packages will not be considered.  All evaluation/selection criteria must be specifically addressed. A complete nomination package includes:</p>'
                  + '<p>1)	A completed background form (SBA Form 3300, Award Nominee Background Form) which is available through SBA district offices and online nominations portal.</p>'
                  + '<p>2)	A completed nomination form (SBA Form 3312, Women’s Business Outreach Center of the Year Form) which is available through SBA district offices and the online nominations portal;</p>'
                  + '<p>3)	Any other supporting documentation deemed significant by the nominator, including news clips, letters of recommendation, nomination letter (if not self-nominated) and other evidence of the appropriateness of the nomination (supporting documentation must not exceed 10 pages). Videos will not be considered.</p>'
                  + '<p>4)	A statement by the WBC Director that the Center is in compliance with the Notice of Award.</p>'
                  + '<p>5)	An original 8” x 10” or 5” x 7” photo of the nominated WBC’s Center Director or a digital photo – at  least 300 dpi; photocopies are not acceptable.</p>';

            /*
            $text = '<p>All evaluation/selection criteria must be specifically addressed. A complete nomination package will also include, in the following order if submitted via hard copy:</p>'
              + '1) A single cover page stating —'
              + '<ul><li>the name of the WBC, business addresses with telephone and fax numbers, website, and e-mail address;'
              + '</li>'
              + '<li>the WBC director’s full name, title, business and home addresses with telephone and fax numbers, and e-mail address;'
              + '</li>'
              + '<li>the name of the host organization; the name of the executive director;</li>'
              + '<li>the award for which the nomination is being made;</li>'
              + '<li>the nominator’s name, title, place of business, business address and telephone number and e-mail '
              + 'address; and</li>'
              + '<li>a one-paragraph description of the WBC’s services provided.</li>'
              + '</ul>'
              + '<p>2) A completed background form (SBA Form 3300, Award Nomination Form) which is available through SBA district ' +
                'offices and online nominations portal.</p>'
              + '<p>3) An original 8” x 10” or 5” x 7” photo of the nominated WBC’s Center Director; or a digital photo – at '
              + 'least 300 dpi; photocopies are not acceptable.</p>'
              + '<p>4) A nomination letter, to include a concise statement of the qualities and WBC performance that'
              + ' merit the award, not exceeding five  pages.  In addition to describing the basis for the'
              + ' nomination, the nomination letter should highlight an individual counselor at the WBC who, in'
              + ' the view of the nominator, has excelled in providing counseling, training and other program'
              + ' services to small businesses.  The nomination letter should also highlight a success story'
              + ' relating to a particular client business served by the WBC.</p>'
              + '<p>5) A brief biography of the Center Director, not exceeding one page.</p>'
              + '<p>6) A business profile, not exceeding one page, including the WBC mission statement, target '
              + 'market, and types of services offered, including any specialized programs or services.</p>'
              + '<p>7) Any other supporting documentation deemed significant by the nominator, including'
              + ' news clips, letters of recommendation and other evidence of the appropriateness of'
              + 'the nomination. Supporting documentation must not exceed 10 pages. Videos will not'
              + ' be considered.</p>'
              + '<p>8) A completed SBA Form 2137 Award Nomination Consent Form, which is available at SBA offices and through the online nominations portal.</p>'
              + '<p>9) A statement by the WBC Director that the Center is in compliance with the Notice of Award.</p>'*/
            break;
          default:
            $text = '<h3> No guidelines available. </h3>';
        }
      }

      $('#nomination-help-dialog').html($text);
    }

    //}
  //};
//}(jQuery));

  }); // $(document).ready
})(jQuery);
