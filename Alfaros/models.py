from django.db import models
# from django.db.models.signals import post_save
# from django.dispatch import receiver

class alerts(models.Model):
    rule_name = models.CharField(max_length=500)
    incident_type = models.CharField(max_length=100)
    tool_alias = models.CharField(max_length=500,default="Unknown", blank=True)
    date = models.CharField(max_length=19)
    severity = models.CharField(max_length=2)
    source = models.CharField(max_length=200,default="Unknown", blank=True)
    destination = models.CharField(max_length=200,default="Unknown", blank=True)
    is_threat = models.CharField(max_length=7,default="Unknown", blank=True)
    manager = models.CharField(max_length=100,default="Pending...", blank=True)
    status = models.CharField(max_length=100,default="Pending...", blank=True)
    analyst_note= models.CharField(max_length=2000, default="", blank=True)
    def __str__(self):
        return str(self.id)


class TimeRules(models.Model):
    rule_name = models.CharField(max_length=500,primary_key=True)
    time = models.FloatField()
    severity = models.FloatField()
    autoincr = models.CharField(max_length=5, default='FALSE')
    status=models.CharField(max_length=15, default='Disabled')
    def __str__(self):
        return str(self.rule_name)

class false(models.Model):
    rule_name = models.CharField(max_length=500)
    incident_type = models.CharField(max_length=100)
    tool_alias = models.CharField(max_length=500, default="Unknown", blank=True)
    date = models.CharField(max_length=19)
    severity = models.CharField(max_length=2)
    source = models.CharField(max_length=200, default="Unknown", blank=True)
    destination = models.CharField(max_length=200, default="Unknown", blank=True)
    is_threat = models.CharField(max_length=7, default="Unknown", blank=True)
    manager = models.CharField(max_length=100, default="Pending...", blank=True)
    status = models.CharField(max_length=15,default="False Positive")
    def __str__(self):
        return str(self.rule_name)


class generate_report(models.Model):
    report_name= models.CharField(max_length=500)
    type = models.CharField(max_length=100,default="Default")
    schedule=models.CharField(max_length=50)
    search=models.CharField(max_length=1000)
    creation_date=models.CharField(max_length=19)
    next_run_time=models.FloatField()
    owner=models.CharField(max_length=100,default="System")
    view=models.CharField(max_length=50,default="HTML")
    def __str__(self):
        return str(self.report_name)


class report(models.Model):
    report_name= models.CharField(max_length=500)
    type=models.CharField(max_length=100)
    schedule=models.CharField(max_length=50)
    creation_date=models.CharField(max_length=19)
    next_run_time=models.CharField(max_length=19)
    owner=models.CharField(max_length=100)
    view=models.CharField(max_length=50)
    def __str__(self):
        return str(self.report_name)


#admin only
class ticket_monitoring(models.Model):
    severity = models.CharField(max_length=2,primary_key=True)
    time= models.FloatField()
    auto_notify = models.CharField(max_length=8,default="DISABLED")
    notify_time=models.FloatField(default=1)
    def __str__(self):
        return str(self.severity)

class open_ticket(models.Model):
    id = models.IntegerField(primary_key=True)
    time=models.FloatField()
    current=models.FloatField()
    half=models.FloatField()
    auto=models.CharField(max_length=6)
    expiring=models.FloatField()
    expired=models.CharField(max_length=1,default="0")
    manager=models.CharField(max_length=100)
    def __str__(self):
        return str(self.id)
