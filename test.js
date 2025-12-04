/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */

define(['N/log', 'N/record', 'N/https', 'N/runtime', 'N/url'],
    (log, record, https, runtime, url) => {

        const afterSubmit = (context) => {
            let rec;
            try {
                if (context.type !== context.UserEventType.CREATE) {
                    return;
                }

                rec = context.newRecord;

                log.debug("SCRIPT START", {
                    recordId: rec.id
                });

                let tranType = rec.getValue({ fieldId: 'custbodytran_typ' });

                if (tranType != 2) {
                    log.debug("STOPPED", "Must be tranType = 2");
                    return;
                }

                var domain = url.resolveDomain({
                    hostType: url.HostType.APPLICATION
                });

                var restletUrl = url.resolveScript({
                    scriptId: 'customscript_vnmt_rl_create_je',
                    deploymentId: 'customdeploy_vnmt_rl_create_je',
                    returnExternalUrl: false
                });



                log.debug('SuiteLet URL', domain + ' | ' + restletUrl);
                const fullUrl = 'https://' + domain + restletUrl;

                var response = https.requestRestlet({
                    scriptId: 'customscript_vnmt_rl_create_je',
                    deploymentId: 'customdeploy_vnmt_rl_create_je',
                    method: 'POST',
                    body: JSON.stringify({ recordId: rec.id }),
                    headers: { 'Content-Type': 'application/json' }
                });


            } catch (error) {
                log.error("SCRIPT ERROR", error);

                try {
                    record.submitFields({
                        type: rec.type,
                        id: rec.id,
                        values: {
                            custbody_vnmt_je_creation_error: error.message
                        }
                    });
                } catch (errUpdate) {
                    log.error("FAILED TO UPDATE ERROR FIELD", errUpdate);
                }
            }
        };

        return { afterSubmit };
    });