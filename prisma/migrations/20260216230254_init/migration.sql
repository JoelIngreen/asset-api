-- CreateTable
CREATE TABLE "assets" (
    "id" SERIAL NOT NULL,
    "prisma_id" VARCHAR(255) NOT NULL,
    "asset_name" TEXT,
    "equipment_type" TEXT,
    "business_unit" TEXT,
    "parent_asset" VARCHAR(255),
    "company_level" DOUBLE PRECISION,
    "priority" DOUBLE PRECISION,
    "equipment_state" VARCHAR(255),
    "is_linear_asset" DOUBLE PRECISION,
    "record_state" VARCHAR(255),
    "custom_is_tu" DOUBLE PRECISION,
    "site_id" SMALLINT NOT NULL,

    CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "documents" (
    "id" VARCHAR(255) NOT NULL,
    "asset_id" INTEGER,
    "file_name" VARCHAR(255) NOT NULL,
    "md5" VARCHAR(32) NOT NULL,
    "storage_path" VARCHAR(500) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "metadata" (
    "id" SERIAL NOT NULL,
    "metadata_name" VARCHAR(255) NOT NULL,

    CONSTRAINT "metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "values" (
    "id" SERIAL NOT NULL,
    "id_metadata" INTEGER NOT NULL,
    "id_document" VARCHAR(255) NOT NULL,
    "value" TEXT,

    CONSTRAINT "values_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "work_orders" (
    "asset_id" INTEGER NOT NULL,
    "work_order" DOUBLE PRECISION NOT NULL,
    "work_order_name" TEXT,
    "work_order_source" VARCHAR(255),
    "work_order_date" TIMESTAMP,
    "work_order_state" VARCHAR(255),
    "work_type" VARCHAR(255),
    "work_procedure" VARCHAR(255),
    "work_shop" VARCHAR(255),
    "equipment_type" VARCHAR(255),
    "business_unit" VARCHAR(255),
    "company_level" DOUBLE PRECISION,
    "planned_date" TIMESTAMP,
    "min_planned_date" TIMESTAMP,
    "max_planned_date" TIMESTAMP,
    "planned_down_time" DOUBLE PRECISION,
    "priority" DOUBLE PRECISION,
    "supplier" VARCHAR(255),
    "closing_date" TIMESTAMP,
    "closed" BOOLEAN,
    "requester" VARCHAR(255),
    "is_parent_wo" BOOLEAN,
    "planning_number" DOUBLE PRECISION,
    "is_equipment_preventive" BOOLEAN,
    "is_sale_invoiced" BOOLEAN,
    "initial_worked_out_date" TIMESTAMP,
    "total_own_labor_amount" DOUBLE PRECISION,
    "total_own_labor_time" DOUBLE PRECISION,
    "total_supplied_labor_amount" DOUBLE PRECISION,
    "total_supplied_labor_time" DOUBLE PRECISION,
    "total_issue_amount" DOUBLE PRECISION,
    "total_ext_mat_amount" DOUBLE PRECISION,
    "total_charge_amount" DOUBLE PRECISION,
    "total_tool_amount" DOUBLE PRECISION,
    "total_tool_time" DOUBLE PRECISION,
    "total_down_time" DOUBLE PRECISION,
    "total_down_time_amount" DOUBLE PRECISION,
    "flow_wo_to_closing" DOUBLE PRECISION,
    "carried_out" BOOLEAN,
    "custom_service_affection" DOUBLE PRECISION,

    CONSTRAINT "work_orders_pkey" PRIMARY KEY ("asset_id","work_order")
);

-- CreateIndex
CREATE UNIQUE INDEX "assets_prisma_id_key" ON "assets"("prisma_id");

-- CreateIndex
CREATE UNIQUE INDEX "documents_md5_key" ON "documents"("md5");

-- CreateIndex
CREATE UNIQUE INDEX "metadata_metadata_name_key" ON "metadata"("metadata_name");

-- AddForeignKey
ALTER TABLE "documents" ADD CONSTRAINT "documents_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "values" ADD CONSTRAINT "values_id_metadata_fkey" FOREIGN KEY ("id_metadata") REFERENCES "metadata"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "values" ADD CONSTRAINT "values_id_document_fkey" FOREIGN KEY ("id_document") REFERENCES "documents"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
