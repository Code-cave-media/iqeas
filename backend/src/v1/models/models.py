from django.db import models


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

class User(TimeStampedModel):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=15, blank=True, null=True)
    active = models.BooleanField(default=True)
    role = models.CharField(max_length=50, choices=[
        ('admin', 'Admin'),
        ('rfq', 'RFQ Manager'),
        ('estimation', 'Estimation Department'),
        ("pm", "Project Manager"),
        ('working', 'Working Team'),
        ('documentation', 'Documentation Team'),
        ('project_coordinator', 'Project Coordinator'),
        ('project_leader', 'Project Leader'),
    ])
    password = models.CharField(max_length=128) 

class Team(TimeStampedModel):
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    members = models.ManyToManyField(User, related_name='teams', blank=True)

class UploadedFile(TimeStampedModel):
    label = models.CharField(max_length=100)
    file = models.CharField(max_length=255)
    uploaded_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='uploaded_files')
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
    ], default='under_review')

class Project(TimeStampedModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='projects')
    name = models.CharField(max_length=100)
    project_id = models.CharField(max_length=50, unique=True)
    received_date = models.DateField()
    client_name = models.CharField(max_length=100)
    client_company = models.CharField(max_length=100)
    location = models.CharField(max_length=100)
    project_type = models.CharField(max_length=50, choices=[
        ('pipeline', 'Pipeline'),
        ('plant', 'Plant'),
        ('Maintenance', 'Maintenance'),
        ('other', 'Other'),
    ])
    priority = models.CharField(max_length=20, choices=[
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ])
    contact_person = models.CharField(max_length=100)
    contact_person_phone = models.CharField(max_length=15, blank=True, null=True)
    contact_person_email = models.EmailField(blank=True, null=True)
    notes = models.TextField(blank=True, null=True)
    uploaded_files = models.ManyToManyField('UploadedFile', related_name='projects', blank=True)
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('under_review', 'Under Review'),
        ('approved', 'Approved'),
        ('rejected', 'Rejected'),
        ('completed', 'Completed'), 
    ], default='draft')
    send_to_estimation = models.BooleanField(default=False)
    send_to_coordinator = models.BooleanField(default=False)
    coordinator = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='coordinator_projects')

class ProjectMoreInfo(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='more_info')
    uploaded_files = models.ManyToManyField(UploadedFile, related_name='project_more_info', blank=True)
    notes = models.TextField(blank=True, null=True)
    enquiry = models.TextField(blank=True, null=True)

class Estimation(TimeStampedModel):
    project = models.OneToOneField(Project, on_delete=models.CASCADE, related_name='estimation')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='estimations')
    status = models.CharField(max_length=20, choices=[
        ('draft', 'Draft'),
        ('under_review', 'Under Review'),
        ('sent_to_client', 'Sent to Client'),
        ('estimation_approved', 'Estimation Approved'),
        ('estimation_rejected', 'Estimation Rejected'),
    ], default='draft')
    log = models.TextField(blank=True, null=True)
    cost = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    deadline = models.DateField(blank=True, null=True)
    approval_date = models.DateField(blank=True, null=True)
    approved = models.BooleanField(default=False)
    sent_to_pm = models.BooleanField(default=False)
    forward_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='forwarded_estimations')
    notes = models.TextField(blank=True, null=True)
    updates = models.TextField(blank=True, null=True)
    uploaded_files = models.ManyToManyField(UploadedFile, related_name='estimations', blank=True)

class ProjectTimeLine(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='timelines')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='timelines')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    start_date = models.DateField()
    end_date = models.DateField(blank=True, null=True)
    completed = models.BooleanField(default=False)

class DeliverablesSubmission(TimeStampedModel):
    selected_files = models.ManyToManyField(UploadedFile, related_name='deliverables_submissions', blank=True)
    uploaded_files = models.ManyToManyField(UploadedFile, related_name='deliverables_uploaded_files', blank=True)

class Delivery(TimeStampedModel):
    project = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='deliveries')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='deliveries')
    title = models.CharField(max_length=100)
    category = models.CharField(max_length=50, choices=[
        ('mechanical', 'Mechanical'),
        ('electrical', 'Electrical'),
        ('civil', 'Civil'),
        ('instrumentation', 'Instrumentation'),
        ('other', 'Other'),
    ])
    description = models.TextField(blank=True, null=True)
    priority = models.CharField(max_length=20, choices=[
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ])
    stage = models.CharField(max_length=20, choices=[
        ('idc','IDC'),
        ('idf','IFR'),
        ('ifa','IFA'),
        ('afc','AFC'),
    ])
    hours = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True)
    uploaded_files = models.ManyToManyField(UploadedFile, related_name='deliveries', blank=True)
    submission = models.ForeignKey(DeliverablesSubmission, on_delete=models.SET_NULL, related_name='deliveries', null=True, blank=True)
    status = models.CharField(max_length=20, choices=[
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),])
    verification_status = models.CharField(max_length=20, choices=[
        ('not_submitted', 'Not Submitted'),
        ('submitted', 'Submitted'),
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ], default='not_submitted')

class DeliveryVerification(TimeStampedModel):
    delivery = models.ForeignKey(Delivery, on_delete=models.CASCADE, related_name='verifications')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='delivery_verifications')
    status = models.CharField(max_length=20, choices=[
        ('verified', 'Verified'),
        ('rejected', 'Rejected'),
    ])
    notes = models.TextField(blank=True, null=True)
    uploaded_files = models.ManyToManyField(UploadedFile, related_name='delivery_verification_files', blank=True)

class Task(TimeStampedModel):
    project  = models.ForeignKey(Project, on_delete=models.CASCADE, related_name='tasks')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=[
        ('to_do', 'To DO'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),])
    priority = models.CharField(max_length=20, choices=[
        ('high', 'High'),
        ('medium', 'Medium'),
        ('low', 'Low'),
    ], default='medium')
    start_date = models.DateField()
    due_date = models.DateField(blank=True, null=True)
    selected_files = models.ManyToManyField(UploadedFile, related_name='tasks', blank=True)
    uploaded_files = models.ManyToManyField(UploadedFile, related_name='task_uploaded_files', blank=True)
    hours = models.DecimalField(max_digits=10, decimal_places=2, blank=True, null=True) 
    assigned_team = models.ForeignKey(Team, on_delete=models.SET_NULL, null=True, blank=True, related_name='tasks')
    assigned_individual = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_tasks')
    completed = models.BooleanField(default=False)

class TaskActivityLog(TimeStampedModel):
    ACTION_CHOICES = [
        ('start', 'Start'),
        ('pause', 'Pause'),
        ('re_open', 'Re-open'),
        ('complete', 'Complete'),
    ]
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='activity_logs')
    action = models.CharField(max_length=100)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_activity_logs')
    note = models.TextField(blank=True, null=True)
    uploaded_files = models.ManyToManyField(UploadedFile, related_name='task_activity_files', blank=True, null=True)
    def __str__(self):
        return f"{self.task.title} - {self.action} @ {self.created_at.strftime('%Y-%m-%d %H:%M:%S')} by {self.user.name}"
    
class TaskChat(TimeStampedModel):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='chats')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='task_chats')
    message = models.TextField()
    uploaded_files = models.ManyToManyField(UploadedFile, related_name='task_chat_files', blank=True,null=True)
    def __str__(self):
        return f"{self.user.name} - {self.message[:20]} @ {self.created_at.strftime('%Y-%m-%d %H:%M:%S')}"
