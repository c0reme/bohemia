CREATE TABLE bohemia."projectAssignment" (
"assignmentId" bigserial NOT NULL PRIMARY KEY,
"projectFK" bigint NOT NULL CONSTRAINT "projectAssignment_project_projectId_fk" REFERENCES bohemia.project,
"studioFK" bigint NOT NULL CONSTRAINT "projectAssignment_studio_studioId_fk" REFERENCES bohemia.studio,
"startDate" date NOT NULL,
"endDate" date NULLS,
status varchar(50) NOT NULL
);