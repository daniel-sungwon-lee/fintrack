CREATE TABLE "users" (
	"userId" serial NOT NULL,
	"email" TEXT NOT NULL,
	"hashedPassword" TEXT NOT NULL,
	CONSTRAINT "users_pk" PRIMARY KEY ("userId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "institutions" (
	"item_id" TEXT NOT NULL,
	"access_token" TEXT NOT NULL,
	"userId" integer NOT NULL,
	"name" TEXT NOT NULL,
	CONSTRAINT "institutions_pk" PRIMARY KEY ("item_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "accounts" (
	"account_id" TEXT NOT NULL,
	"item_id" TEXT NOT NULL,
	"name" TEXT NOT NULL,
	"type" TEXT NOT NULL,
	"subtype" TEXT NOT NULL,
	"balance" numeric NOT NULL,
	"account_num" TEXT,
	"routing_num" TEXT,
	"limit" numeric,
	"next_payment_due_date" TEXT,
	"last_statement_balance" numeric,
	"minimum_payment_amount" numeric,
	"next_monthly_payment" numeric,
	"interest_rate" numeric,
	"holdings" JSON,
	"securitiesAmount" integer,
	CONSTRAINT "accounts_pk" PRIMARY KEY ("account_id")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "trackers" (
	"trackerId" serial NOT NULL,
	"userId" integer NOT NULL,
	"name" TEXT NOT NULL,
	"total" numeric NOT NULL,
	"fromDate" TEXT NOT NULL,
	"toDate" TEXT NOT NULL,
	CONSTRAINT "trackers_pk" PRIMARY KEY ("trackerId")
) WITH (
  OIDS=FALSE
);



CREATE TABLE "transactions" (
	"transaction_id" TEXT NOT NULL,
	"trackerId" integer NOT NULL,
	"account_id" TEXT NOT NULL,
	"amount" numeric NOT NULL,
	"category" TEXT NOT NULL,
	"date" TEXT NOT NULL,
	"iso_currency_code" TEXT NOT NULL,
	"name" TEXT NOT NULL
) WITH (
  OIDS=FALSE
);



CREATE TABLE "budgets" (
	"budgetId" serial NOT NULL,
	"userId" integer NOT NULL,
	"name" TEXT NOT NULL,
	"frequency" TEXT NOT NULL,
	"fromDate" TEXT NOT NULL,
	"toDate" TEXT NOT NULL,
	"rows" JSON NOT NULL,
	CONSTRAINT "budgets_pk" PRIMARY KEY ("budgetId")
) WITH (
	OIDS=FALSE
);




ALTER TABLE "institutions" ADD CONSTRAINT "institutions_fk0" FOREIGN KEY ("userId") REFERENCES "users"("userId");

ALTER TABLE "accounts" ADD CONSTRAINT "accounts_fk0" FOREIGN KEY ("item_id") REFERENCES "institutions"("item_id");

ALTER TABLE "trackers" ADD CONSTRAINT "trackers_fk0" FOREIGN KEY ("userId") REFERENCES "users"("userId");

ALTER TABLE "transactions" ADD CONSTRAINT "transactions_fk0" FOREIGN KEY ("trackerId") REFERENCES "trackers"("trackerId");

ALTER TABLE "budgets" ADD CONSTRAINT "budgets_fk0" FOREIGN KEY ("userId") REFERENCES "users"("userId");
