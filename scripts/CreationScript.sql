create schema
if not exists bohemia;

drop sequence if exists address_seq;
create sequence address_seq start 1 increment 1;
create table if not exists bohemia.address
(
    "addressId" bigserial not null primary key,
    "addressLine" varchar(255) not null,
    "postCode" varchar(255) not null
);

drop sequence if exists employee_seq;
create sequence employee_seq start 1 increment 1;
create table if not exists bohemia.employee
(
    "employeeid" bigserial not null primary key,
    "firstname" varchar(255) not null,
    "lastname" varchar(255) not null,
    "addressfk" bigint not null constraint employee_address_addressId_fk references bohemia.address,
    email varchar(255) not null constraint employee_email_is_email check (email like \'%_@_%\'),
    username varchar(255) not null,
    phone int not null,
    "alternativePhone" int null,
    "currentProject" varchar(255) not null,
    "pastProjects" varchar(255) not null
);

drop sequence if exists project_seq;
create sequence project_seq start 1 increment 1;
create table if not exists bohemia.project
(
    "projectId" bigserial not null primary key,
    "projectName" varchar(255) not null,
    description varchar(255) not null,
    platform varchar(100) not null,
    genre varchar(100) null
);

drop sequence if exists studio_seq;
create sequence studio_seq start 1 increment 1;
create table if not exists bohemia.studio
(
    "studioId" bigserial not null primary key,
    "studioName" varchar(255) not null,
    description varchar(1000) not null,
    platform varchar(255) not null,
    "studioHead" varchar(255) not null,
    phone bigint not null,
    "alternativePhone" bigint null,
    email varchar(255) not null constraint studio_email_is_email check (email like \'%_@_%\'),
    "addressFK" bigint not null constraint studio_address_addressId_fk references bohemia.address,  
    platform varchar(255) not null
);

drop sequence if exists contract_seq;
create sequence contract_seq start 1 increment 1;
create table if not exists bohemia."employeeContract"
(
    "contractId" bigserial not null primary key,
    "employeeFK" bigint not null constraint "employeeContract_employee_employeeId_fk" references bohemia.employee,
    "studioFK" bigint not null constraint "employeeContract_studio_studioId_fk" references bohemia.studio,
    "startDate" date default current_date not null,
    "endDate" date null,
    status varchar(50) not null,
    "currentRole" varchar(50) not null
);

drop sequence if exists assignment_seq;
create sequence assignment_seq start 1 increment 1;
create table if not exists bohemia."projectAssignment"
(
    "assignmentId" bigserial not null primary key,
    "projectFK" bigint not null constraint "projectAssignment_project_projectId_fk" references bohemia.project,
    "studioFK" bigint not null constraint "projectAssignment_studio_studioId_fk" references bohemia.studio,
    "startDate" date default current_date not null,
    "endDate" date null,
    status varchar(50) not null
);
