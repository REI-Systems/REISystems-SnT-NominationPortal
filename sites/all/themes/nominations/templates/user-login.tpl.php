<?php
//print the variables if needed to allow for individual field theming or breaking them up.
/*print '<pre>';
print_r($variables);
print '</pre>';*/

?>
<div id="welcome-information"> <p>National Small Business Week has been recognizing the special impact made by outstanding entrepreneurs
    and small business owners since 1963. During this week, the U.S. Small Business Administration honors
    small business owners and entrepreneurs for their outstanding achievements through various awards.</p>
    <p>SBA is currently seeking nominations from the public for exceptional entrepreneurs. You can use this
    online portal to submit your nomination for the following awards:</p>
    <ul>
        <li> Small Business Person of the Year Awards</li>
        <li>Small Business Exporter of the Year</li>
        <li>Phoenix Award for Small Business Disaster Recovery</li>
        <li>Phoenix Award for Outstanding Contributions to Disaster Recovery
        <li>Federal Procurement Award- Small Business Prime Contractor of the Year Award
        <li>Federal Procurement Award- Small Business Subcontractor of the Year Award
        <li>Federal Procurement Award- Dwight D. Eisenhower Award for Excellence
        <li>8(a) Graduate of the Year Award
        <li>Small Business Development Center Excellence and Innovation Award
        <li>Veterans Business Outreach Center Excellence in Service Award
        <li>Women’s Business Center of Excellence Award</li></ul>
        <p>To use the Small Business Week Nomination Portal, you will need to register for an
            account. Registration is required to protect your information from unauthorized access.
            This site complies with the Federal Information Security Management Act. For more information,
            visit <a href="http://www.sba.gov/about-sba-info/privacy-policy" target="_blank">http://www.sba.gov/about-sba-info/privacy-policy.</a> </p></div>

<div class="nominations-user-login-form-wrapper">
    <div class="login-wrapper">
    <h2><?php print render($intro_text); ?></h2>

        <?php
        // split the username and password from the submit button so we can put in links above
        print drupal_render($form['name']);
        print drupal_render($form['pass']);

        ?>

        <div class="user-links">
          <div class="new-to-site"> New to the Site? </div> <span class="reglink"><a href="/user/register" title="Register Here">Register Here</a></span>
            <span class="passlink"><a href="/user/password" title="Forgot your password?">Forgot your password?</a></span>
        </div>
    <div id="browser-note">
        <span class="note">Note:</span> This application is not supported by Internet Explorer 6.0 & 7.0. Please use one of the supported browsers (IE 8.0 and higher, Firefox, Chrome).
    </div>
        <?php
        print drupal_render($form['form_build_id']);
        print drupal_render($form['form_id']);
        print drupal_render($form['actions']);
        ?>
    </div><!--//login-wrapper-->
</div><!--//nominations-user-login-form-wrapper -->

