# Job Click Portal

## Product Vision

Job Click Portal is an AI-powered recruitment marketplace and Applicant Tracking System (ATS) that connects job seekers and employers through intelligent matching, streamlined hiring workflows, and modern recruitment tools.

The platform combines the strengths of professional networking platforms, job portals, and recruitment management systems into a single ecosystem.

---

# 1. Objectives

## Business Objectives

* Connect job seekers with employers
* Simplify recruitment processes
* Reduce hiring time
* Improve candidate-job matching quality
* Generate revenue through subscriptions and premium services
* Build a trusted recruitment ecosystem

## User Objectives

### Candidates

* Create professional profiles
* Discover suitable jobs
* Apply efficiently
* Track application progress
* Communicate with recruiters

### Employers

* Post jobs
* Search and engage candidates
* Manage recruitment pipelines
* Analyze hiring performance

---

# 2. User Types

## 2.1 Platform Admin

Platform-level administrators who manage the entire system.

### Responsibilities

* User management
* Company verification
* Job moderation
* Subscription management
* Fraud detection
* Analytics monitoring
* Content moderation

---

## 2.2 Company Admin

Organization account owner.

### Responsibilities

* Manage company profile
* Manage recruiters
* Manage hiring managers
* Manage subscription plans
* View company analytics
* Control permissions
* Approve job postings

### Permissions

* Full company access
* Recruiter management
* Billing management
* Job approval
* Team management

---

## 2.3 Recruitment Manager

Optional role for medium and large companies.

### Responsibilities

* Supervise recruiters
* Approve recruitment activities
* Monitor hiring progress
* Review recruiter performance

---

## 2.4 Recruiter

Operational recruitment users.

### Responsibilities

* Create job postings
* Review applications
* Search candidates
* Conduct interviews
* Manage hiring pipelines
* Send offers

### Permissions

* Manage assigned jobs
* Manage assigned candidates
* Schedule interviews
* Communicate with candidates

---

## 2.5 Hiring Manager

Department manager involved in recruitment.

### Responsibilities

* Review shortlisted candidates
* Conduct interviews
* Provide hiring feedback
* Approve hiring decisions

---

## 2.6 Candidate

Job seekers using the platform.

### Responsibilities

* Build profile
* Upload resume
* Search jobs
* Apply for jobs
* Attend interviews
* Track applications

---

# 3. System Hierarchy

```text
Platform Admin
│
├── Company
│    │
│    ├── Company Admin
│    │
│    ├── Recruitment Manager
│    │
│    ├── Recruiter
│    │
│    └── Hiring Manager
│
└── Candidate
```

---

# 4. Business Flow

## Candidate Journey

```text
Register
    ↓
Verify Email/Phone
    ↓
Create Profile
    ↓
Upload Resume
    ↓
Complete Skills
    ↓
Receive Recommendations
    ↓
Apply Job
    ↓
Interview
    ↓
Offer
    ↓
Hire
```

---

## Employer Journey

```text
Register Company
    ↓
Company Verification
    ↓
Create Company Profile
    ↓
Invite Recruiters
    ↓
Create Job
    ↓
Receive Applications
    ↓
Review Candidates
    ↓
Interview
    ↓
Offer
    ↓
Hire
```

---

# 5. Candidate Module

## Candidate Dashboard

### Dashboard Widgets

* Profile Completion
* Recommended Jobs
* Recent Applications
* Interview Invitations
* Saved Jobs
* Notifications

---

## Candidate Profile

### Personal Information

* Full Name
* Profile Photo
* Date of Birth
* Gender
* Nationality
* Phone Number
* Email
* Address

### Professional Summary

* Headline
* Professional Summary
* Career Objective

### Employment Preferences

* Preferred Job Titles
* Preferred Locations
* Employment Type
* Work Arrangement
* Expected Salary

### Work Experience

* Company Name
* Position
* Duration
* Responsibilities
* Achievements

### Education

* Institution
* Degree
* Major
* Graduation Year

### Skills

* Technical Skills
* Soft Skills
* Language Skills

### Certifications

* Certification Name
* Issuing Organization
* Expiry Date

### Portfolio

* LinkedIn
* GitHub
* Website
* Behance
* Dribbble

---

## Resume Management

### Features

* Upload Resume
* Multiple Resume Versions
* Resume Preview
* Resume Download
* Resume Parsing

---

## Job Search

### Search Filters

* Keywords
* Location
* Salary
* Industry
* Company
* Employment Type
* Experience Level
* Remote Jobs

---

## Saved Jobs

### Features

* Save Job
* Remove Saved Job
* Apply Later

---

## Application Tracking

### Application Status

```text
Applied
↓
Viewed
↓
Screening
↓
Shortlisted
↓
Interview
↓
Offer
↓
Hired
```

---

## Messaging

### Features

* Chat with Recruiters
* Attachment Support
* Interview Invitations
* System Notifications

---

# 6. Recruiter Module

## Recruiter Dashboard

### KPIs

* Active Jobs
* New Applications
* Interviews Scheduled
* Offers Sent
* Hires Completed

---

## Job Management

### Features

* Create Job
* Edit Job
* Duplicate Job
* Pause Job
* Close Job
* Archive Job

---

## Job Posting

### Job Information

#### Basic Information

* Job Title
* Department
* Location
* Employment Type

#### Requirements

* Experience
* Skills
* Education
* Certifications
* Languages

#### Compensation

* Salary Range
* Benefits
* Bonuses

---

## Applicant Management

### Features

* View Applications
* Candidate Ranking
* Resume Review
* Candidate Notes
* Candidate Tags

---

## Recruitment Pipeline

```text
Applied
↓
Screening
↓
Shortlisted
↓
Assessment
↓
Interview
↓
Offer
↓
Hired
```

---

## Candidate Search

### Search Filters

* Skills
* Experience
* Salary
* Location
* Industry
* Availability

---

## Talent Pool

### Talent Collections

* Java Developers
* Frontend Developers
* DevOps Engineers
* Future Opportunities

---

## Interview Management

### Features

* Schedule Interview
* Reschedule Interview
* Cancel Interview
* Online Meeting Links
* Feedback Collection

---

## Offer Management

### Features

* Create Offer
* Track Offer Status
* Candidate Acceptance
* Candidate Rejection

---

# 7. Company Admin Module

## Company Dashboard

### KPIs

* Active Jobs
* Recruiters
* Applications
* Interviews
* Hires
* Subscription Status

---

## Company Profile

### Information

* Company Name
* Logo
* Website
* Industry
* Description
* Locations
* Company Size

---

## Recruiter Management

### Features

* Create Recruiter
* Edit Recruiter
* Deactivate Recruiter
* Assign Recruiters
* Transfer Ownership

---

## Team Permissions

### Roles

#### Company Admin

* Full Access

#### Recruitment Manager

* Recruiter Management
* Reporting

#### Recruiter

* Recruitment Activities

#### Hiring Manager

* Candidate Review

---

## Job Approval Workflow

```text
Recruiter Creates Job
        ↓
Manager Approval
        ↓
Company Admin Approval
        ↓
Published
```

---

## Subscription Management

### Features

* Manage Plans
* Billing
* Invoices
* Payment Methods
* Renewals

---

## Company Analytics

### Metrics

* Time to Hire
* Cost per Hire
* Applications per Job
* Recruiter Performance
* Hiring Funnel Conversion

---

# 8. Platform Admin Module

## User Management

* Candidate Management
* Company Management
* Recruiter Management

---

## Verification Management

### Company Verification

* Business Registration
* Tax Registration
* Company Website
* Official Email Verification

### Candidate Verification

* Email Verification
* Phone Verification
* ID Verification

---

## Fraud Detection

### Detection Areas

* Fake Companies
* Duplicate Jobs
* Spam Applications
* Scam Activities

---

## System Analytics

### Metrics

* Active Users
* Active Companies
* Jobs Posted
* Applications Submitted
* Hiring Success Rate

---

# 9. Job Recommendation Engine

## Objective

Recommend the most relevant jobs to candidates and the most suitable candidates to recruiters.

---

## Candidate → Job Matching

### Matching Factors

| Factor     | Weight |
| ---------- | ------ |
| Skills     | 40%    |
| Experience | 25%    |
| Location   | 15%    |
| Salary     | 10%    |
| Education  | 10%    |

---

### Match Formula

```text
Final Score =
(
Skill Score × 40
+
Experience Score × 25
+
Location Score × 15
+
Salary Score × 10
+
Education Score × 10
)
÷ 100
```

---

## Recommendation Categories

### Best Matches

90% - 100%

### Good Opportunities

75% - 89%

### Growth Opportunities

60% - 74%

### Trending Jobs

Most viewed and applied jobs.

### New Jobs

Recently posted jobs.

---

## Employer → Candidate Matching

### Candidate Ranking

Factors:

* Skills Match
* Experience Match
* Salary Match
* Availability
* Location Match

---

## Behavioral Recommendations

Track:

* Job Views
* Saved Jobs
* Search History
* Application History
* Profile Activity

Use behavior data to improve recommendations.

---

# 10. Notification System

## Candidate Notifications

* Job Recommendations
* Application Updates
* Interview Invitations
* Recruiter Messages

---

## Recruiter Notifications

* New Applications
* Candidate Replies
* Interview Confirmations
* Offer Responses

---

## Delivery Channels

* In-App
* Email
* SMS
* Push Notification

---

# 11. Subscription Model

## Free Plan

### Features

* Limited Job Posts
* Basic Search
* Basic Analytics

---

## Business Plan

### Features

* More Job Posts
* Candidate Search
* Advanced Analytics
* Talent Pool

---

## Enterprise Plan

### Features

* Unlimited Jobs
* ATS Features
* Team Management
* API Access
* Advanced Reporting

---

# 12. AI Features (Phase 3)

## AI Resume Parsing

Automatically extract:

* Skills
* Experience
* Education
* Certifications

---

## AI Job Description Generator

Generate job descriptions from role names.

---

## AI Resume Review

Provide resume improvement suggestions.

---

## AI Interview Question Generator

Generate interview questions based on:

* Job Role
* Skills
* Seniority

---

## AI Semantic Matching

Use vector embeddings to understand relationships between:

* Skills
* Roles
* Technologies

Example:

```text
Spring Boot
Hibernate
Maven
```

Can match:

```text
Java Backend Developer
```

Without exact keyword matching.

---

# 13. Core Database Entities

## User Management

* Users
* Roles
* Permissions

## Company Management

* Companies
* CompanyUsers
* CompanyVerification

## Candidate Management

* CandidateProfiles
* CandidateSkills
* CandidateExperiences
* CandidateEducations
* CandidateCertifications
* Resumes

## Recruitment

* Jobs
* JobSkills
* Applications
* ApplicationStatus
* Interviews
* Offers

## Communication

* Messages
* Notifications

## Recommendation Engine

* JobMatchScores
* CandidateMatchScores
* SearchHistory
* RecommendationLogs

## Subscription

* Plans
* Subscriptions
* Payments
* Invoices

## Audit

* AuditLogs
* ActivityLogs

---

# 14. MVP Scope

## Phase 1

### Candidate

* Registration
* Profile Management
* Resume Upload
* Job Search
* Job Application

### Employer

* Company Registration
* Recruiter Management
* Job Posting
* Application Management

### Admin

* Company Verification
* User Management

---

## Phase 2

* Recommendation Engine
* Messaging
* Notifications
* Interview Scheduling
* Analytics

---

## Phase 3

* AI Resume Parsing
* AI Matching
* AI Interview Questions
* Subscription Billing
* Enterprise Features

---

# Success Metrics

## Candidate Metrics

* Profile Completion Rate
* Application Rate
* Interview Rate
* Hiring Rate

## Employer Metrics

* Time to Hire
* Cost per Hire
* Application Quality
* Recruiter Productivity

## Platform Metrics

* Active Users
* Active Companies
* Monthly Applications
* Monthly Hires
* Subscription Revenue
* User Retention
* Recommendation Click Rate

```
```
