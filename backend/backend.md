Anunay Here 
i have added the basic detection logic for now, which starts with base.py and models.py files 

base.py is there as an interface for the different types of rules on which our evaluation system is going to work on 

models.py is there so that to capture the information for a set of events that have occured and evaluate the confidence in that event and this is the output for our detections

ok so we have implemented 5 rules for now 

1. brute force - Triggers when threshold of failed logins from a single IP is exceeded within a time window.
2. privilege_escalation - Triggers when a standard user account performs unauthorized privilege changes or runs administrative commands.
3. port_scan - Triggers when a single source IP attempts to access multiple distinct destination ports within a short time window.
4. sensitive_resource_access - Triggers when a user or process accesses a known sensitive resource such as credentials, private keys, or security      configuration.
5. data_exfiltration - Triggers when an unusually large amount of data is transferred from an internal host to an external destination within a short time window.





