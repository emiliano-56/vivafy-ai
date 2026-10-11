import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

/**
 * ============================================================
 * JVZOO IPN V2 - VIVAFY AI
 * ============================================================
 *
 * Receives:
 * application/x-www-form-urlencoded
 *
 * Endpoint:
 * /api/jvzoo/ipn
 *
 * Handles:
 * SALE
 * BILL
 * RFND
 *
 * Uses existing:
 * public.profiles
 *
 * Existing credit column:
 * public.profiles.credits
 * ============================================================
 */

export const runtime = "nodejs";


// ============================================================
// ENVIRONMENT VARIABLES
// ============================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY;

const JVZOO_SECRET_KEY = process.env.JVZOO_SECRET_KEY;


// ============================================================
// BASIC ENVIRONMENT VALIDATION
// ============================================================

if (!SUPABASE_URL) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL");
}

if (!SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
}

if (!JVZOO_SECRET_KEY) {
  console.error("Missing JVZOO_SECRET_KEY");
}


// ============================================================
// SUPABASE ADMIN CLIENT
// ============================================================
//
// IMPORTANT:
// This uses the service-role key because the JVZoo webhook
// is server-to-server and must be able to update profiles.
// NEVER expose this key to the browser.
// ============================================================

const supabaseAdmin = createClient(
  SUPABASE_URL!,
  SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);


// ============================================================
// JVZOO PRODUCT CONFIGURATION
// ============================================================
//
// CHANGE THE CREDIT VALUES HERE LATER.
//
// These are SAMPLE values for now.
// ============================================================

const JVZOO_PRODUCTS: Record<
  string,
  {
    name: string;
    credits: number;
  }
> = {
  "452417": {
    name: "Vivafy AI - Front End",
    credits: 500,
  },

  "452825": {
    name: "Vivafy AI - Platinum Edition",
    credits: 800,
  },

  "452821": {
    name: "Vivafy AI - Agentic PRO",
    credits: 1000,
  },

  "452823": {
    name: "Vivafy AI Studio",
    credits: 1100,
  },

  "452419": {
    name: "Vivafy AI - Reseller",
    credits: 1200,
  },

  "452827": {
    name: "Vivafy AI - Whitelabel",
    credits: 1500,
  },
};
// ============================================================
// HELPER: SHA-1 JVZOO V2 VERIFICATION
// ============================================================

function calculateJVZooVerify(params: {
  paykey: string;
  customerEmail: string;
  productName: string;
  transactionType: string;
  date: string;
}): string {

  /**
   * JVZoo V2 exact algorithm:
   *
   * paykey|customer_email|product_name|transaction_type|date|
   * SECRET_KEY
   */

  const verificationString =
    `${params.paykey}|` +
    `${params.customerEmail}|` +
    `${params.productName}|` +
    `${params.transactionType}|` +
    `${params.date}|` +
    `${JVZOO_SECRET_KEY}`;

  return crypto
    .createHash("sha1")
    .update(verificationString, "utf8")
    .digest("hex")
    .substring(0, 8)
    .toUpperCase();
}


// ============================================================
// HELPER: SAFE JSON PARSER
// ============================================================

function parseJsonSafely(value: string | null) {
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(
      "Failed to parse transactionPayouts:",
      error
    );

    return null;
  }
}


// ============================================================
// POST
// ============================================================

export async function POST(request: NextRequest) {

  try {

    // ========================================================
    // CHECK ENVIRONMENT
    // ========================================================

    if (
      !SUPABASE_URL ||
      !SUPABASE_SERVICE_ROLE_KEY ||
      !JVZOO_SECRET_KEY
    ) {

      console.error(
        "JVZoo IPN environment variables are missing."
      );

      return new NextResponse(
        "Server configuration error",
        {
          status: 500,
        }
      );
    }


    // ========================================================
    // READ FORM DATA
    // ========================================================

    const formData = await request.formData();


    // ========================================================
    // HELPER TO GET FORM VALUES
    // ========================================================

    const get = (key: string): string => {
      const value = formData.get(key);

      if (value === null) {
        return "";
      }

      return String(value);
    };


    // ========================================================
    // READ CORE JVZOO FIELDS
    // ========================================================

    const paykey = get("paykey");

    const prekey = get("prekey");

    const transactionId =
      get("transaction_id");

    const transactionType =
      get("transaction_type");

    const total =
      get("total");

    const transactionStatus =
      get("status");

    const date =
      get("date");

    const paymentMethod =
      get("payment_method");

    const incomingVerify =
      get("cverify");


    // ========================================================
    // PRODUCT
    // ========================================================

    const productId =
      get("product_id");

    const productName =
      get("product_name");

    const productType =
      get("product_type");


    // ========================================================
    // CUSTOMER
    // ========================================================

    const customerEmail =
      get("customer_email")
        .trim()
        .toLowerCase();

    const customerFirstName =
      get("customer_first_name");

    const customerLastName =
      get("customer_last_name");

    const customerIp =
      get("customer_ip");

    const customerPhone =
      get("customer_phone");


    // ========================================================
    // VENDOR
    // ========================================================

    const vendorId =
      get("vendor_id");

    const vendorName =
      get("vendor_name");

    const vendorEmail =
      get("vendor_email");


    // ========================================================
    // AFFILIATE
    // ========================================================

    const affiliateId =
      get("affiliate_id");

    const affiliateName =
      get("affiliate_name");

    const affiliateEmail =
      get("affiliate_email");

    const tid =
      get("tid");


    // ========================================================
    // OTHER PARAMS
    // ========================================================

    const otherParams =
      get("other_params");


    // ========================================================
    // TAX / SHIPPING
    // ========================================================

    const taxTotal =
      get("tax_total");

    const vatTax =
      get("vat_tax");

    const nationalSalesTax =
      get("national_sales_tax");

    const internationalSalesTax =
      get("international_sales_tax");

    const shippingFee =
      get("shipping_fee");


    // ========================================================
    // RECURRING
    // ========================================================

    const startDate =
      get("start_date");

    const endDate =
      get("end_date");

    const nextPaymentDate =
      get("next_payment_date");


    // ========================================================
    // PAYOUTS
    // ========================================================

    const transactionPayoutsRaw =
      get("transactionPayouts");

    const transactionPayouts =
      parseJsonSafely(
        transactionPayoutsRaw
      );


    // ========================================================
    // LOG BASIC REQUEST
    // ========================================================

    console.log(
      "JVZoo IPN received:",
      {
        transactionId,
        transactionType,
        productId,
        customerEmail,
      }
    );


    // ========================================================
    // BASIC REQUIRED FIELD VALIDATION
    // ========================================================

    if (!transactionId) {
      return new NextResponse(
        "Missing transaction_id",
        {
          status: 400,
        }
      );
    }

    if (!transactionType) {
      return new NextResponse(
        "Missing transaction_type",
        {
          status: 400,
        }
      );
    }

    if (!productId) {
      return new NextResponse(
        "Missing product_id",
        {
          status: 400,
        }
      );
    }

    if (!customerEmail) {
      return new NextResponse(
        "Missing customer_email",
        {
          status: 400,
        }
      );
    }

    if (!date) {
      return new NextResponse(
        "Missing date",
        {
          status: 400,
        }
      );
    }

    if (!paykey) {
      return new NextResponse(
        "Missing paykey",
        {
          status: 400,
        }
      );
    }

    if (!incomingVerify) {
      return new NextResponse(
        "Missing cverify",
        {
          status: 403,
        }
      );
    }


    // ========================================================
    // ONLY ACCEPT KNOWN TRANSACTION TYPES
    // ========================================================

    const allowedTransactionTypes = [
      "SALE",
      "BILL",
      "RFND",
    ];

    if (
      !allowedTransactionTypes.includes(
        transactionType
      )
    ) {

      console.warn(
        "Unsupported JVZoo transaction type:",
        transactionType
      );

      /**
       * Return 200 because this is a valid webhook request,
       * but one we don't need to process.
       */

      return new NextResponse(
        "Transaction type ignored",
        {
          status: 200,
        }
      );
    }


    // ========================================================
    // VERIFY JVZOO SIGNATURE
    // ========================================================

    const calculatedVerify =
      calculateJVZooVerify({
        paykey,
        customerEmail,
        productName,
        transactionType,
        date,
      });


    console.log(
      "JVZoo verification:",
      {
        incoming: incomingVerify,
        calculated: calculatedVerify,
      }
    );


    // ========================================================
    // TIMING-SAFE VERIFICATION
    // ========================================================

    const incomingBuffer =
      Buffer.from(
        incomingVerify.toUpperCase(),
        "utf8"
      );

    const calculatedBuffer =
      Buffer.from(
        calculatedVerify,
        "utf8"
      );


    if (
      incomingBuffer.length !==
      calculatedBuffer.length ||
      !crypto.timingSafeEqual(
        incomingBuffer,
        calculatedBuffer
      )
    ) {

      console.error(
        "JVZoo verification failed.",
        {
          transactionId,
          productId,
        }
      );

      return new NextResponse(
        "Verification failed",
        {
          status: 403,
        }
      );
    }


    // ========================================================
    // VERIFICATION PASSED
    // ========================================================

    console.log(
      "JVZoo verification successful:",
      transactionId
    );


    // ========================================================
    // CHECK IF TRANSACTION ALREADY EXISTS
    // ========================================================
    //
    // This prevents duplicate crediting.
    // ========================================================

    const {
      data: existingTransaction,
      error: existingTransactionError,
    } = await supabaseAdmin
      .from("jvzoo_transactions")
      .select(
        "id, transaction_id, credits_granted, transaction_type"
      )
      .eq(
        "transaction_id",
        transactionId
      )
      .maybeSingle();


    if (existingTransactionError) {

      console.error(
        "Error checking existing transaction:",
        existingTransactionError
      );

      return new NextResponse(
        "Database error",
        {
          status: 500,
        }
      );
    }


    // ========================================================
    // DUPLICATE REQUEST
    // ========================================================

    if (existingTransaction) {

      console.log(
        "JVZoo transaction already processed:",
        transactionId
      );

      /**
       * IMPORTANT:
       * Do NOT add credits again.
       */

      return new NextResponse(
        "OK",
        {
          status: 200,
        }
      );
    }


    // ========================================================
    // LOOK UP PRODUCT
    // ========================================================

    const productConfig =
      JVZOO_PRODUCTS[productId];


    if (!productConfig) {

      console.error(
        "Unknown JVZoo product:",
        productId
      );

      /**
       * We have verified the request, but we don't know
       * what entitlement this product should receive.
       *
       * Store it with zero credits so you can inspect it.
       */

      const { error: unknownProductError } =
        await supabaseAdmin
          .from("jvzoo_transactions")
          .insert({
            transaction_id:
              transactionId,

            paykey,

            prekey:
              prekey || null,

            transaction_type:
              transactionType,

            transaction_status:
              transactionStatus || null,

            total:
              total
                ? Number(total)
                : null,

            payment_method:
              paymentMethod || null,

            transaction_date:
              date,

            product_id:
              productId,

            product_name:
              productName || null,

            product_type:
              productType || null,

            customer_email:
              customerEmail,

            customer_first_name:
              customerFirstName || null,

            customer_last_name:
              customerLastName || null,

            customer_ip:
              customerIp || null,

            customer_phone:
              customerPhone || null,

            vendor_id:
              vendorId || null,

            vendor_name:
              vendorName || null,

            vendor_email:
              vendorEmail || null,

            affiliate_id:
              affiliateId || null,

            affiliate_name:
              affiliateName || null,

            affiliate_email:
              affiliateEmail || null,

            tid:
              tid || null,

            other_params:
              otherParams || null,

            tax_total:
              taxTotal
                ? Number(taxTotal)
                : null,

            vat_tax:
              vatTax
                ? Number(vatTax)
                : null,

            national_sales_tax:
              nationalSalesTax
                ? Number(nationalSalesTax)
                : null,

            international_sales_tax:
              internationalSalesTax
                ? Number(internationalSalesTax)
                : null,

            shipping_fee:
              shippingFee
                ? Number(shippingFee)
                : null,

            start_date:
              startDate || null,

            end_date:
              endDate || null,

            next_payment_date:
              nextPaymentDate || null,

            cverify:
              incomingVerify,

            transaction_payouts:
              transactionPayouts,

            credits_granted:
              0,

            raw_payload:
              Object.fromEntries(formData.entries()),
          });


      if (unknownProductError) {

        console.error(
          "Failed to save unknown product:",
          unknownProductError
        );

        return new NextResponse(
          "Database error",
          {
            status: 500,
          }
        );
      }


      return new NextResponse(
        "OK",
        {
          status: 200,
        }
      );
    }


    // ========================================================
    // FIND VIVAFY PROFILE
    // ========================================================

    const {
      data: profile,
      error: profileError,
    } = await supabaseAdmin
      .from("profiles")
      .select(
        "id, email, first_name, last_name, username, package, credits"
      )
      .ilike(
        "email",
        customerEmail
      )
      .maybeSingle();


    if (profileError) {

      console.error(
        "Profile lookup error:",
        profileError
      );

      return new NextResponse(
        "Database error",
        {
          status: 500,
        }
      );
    }


    // ========================================================
    // PROFILE NOT FOUND
    // ========================================================

    if (!profile) {

      console.warn(
        "No Vivafy profile found for JVZoo customer:",
        customerEmail
      );

      /**
       * We don't automatically create an auth user here.
       *
       * Instead we store the transaction so it can be
       * reconciled later.
       */

      const { error: missingProfileError } =
        await supabaseAdmin
          .from("jvzoo_transactions")
          .insert({
            transaction_id:
              transactionId,

            paykey,

            prekey:
              prekey || null,

            transaction_type:
              transactionType,

            transaction_status:
              transactionStatus || null,

            total:
              total
                ? Number(total)
                : null,

            payment_method:
              paymentMethod || null,

            transaction_date:
              date,

            product_id:
              productId,

            product_name:
              productName || null,

            product_type:
              productType || null,

            customer_email:
              customerEmail,

            customer_first_name:
              customerFirstName || null,

            customer_last_name:
              customerLastName || null,

            customer_ip:
              customerIp || null,

            customer_phone:
              customerPhone || null,

            vendor_id:
              vendorId || null,

            vendor_name:
              vendorName || null,

            vendor_email:
              vendorEmail || null,

            affiliate_id:
              affiliateId || null,

            affiliate_name:
              affiliateName || null,

            affiliate_email:
              affiliateEmail || null,

            tid:
              tid || null,

            other_params:
              otherParams || null,

            tax_total:
              taxTotal
                ? Number(taxTotal)
                : null,

            vat_tax:
              vatTax
                ? Number(vatTax)
                : null,

            national_sales_tax:
              nationalSalesTax
                ? Number(nationalSalesTax)
                : null,

            international_sales_tax:
              internationalSalesTax
                ? Number(internationalSalesTax)
                : null,

            shipping_fee:
              shippingFee
                ? Number(shippingFee)
                : null,

            start_date:
              startDate || null,

            end_date:
              endDate || null,

            next_payment_date:
              nextPaymentDate || null,

            cverify:
              incomingVerify,

            transaction_payouts:
              transactionPayouts,

            profile_id:
              null,

            credits_granted:
              0,

            raw_payload:
              Object.fromEntries(formData.entries()),
          });


      if (missingProfileError) {

        console.error(
          "Failed to save transaction:",
          missingProfileError
        );

        return new NextResponse(
          "Database error",
          {
            status: 500,
          }
        );
      }


      /**
       * Return 200 because the JVZoo request itself was
       * successfully received and verified.
       *
       * The transaction remains in the database for
       * reconciliation.
       */

      return new NextResponse(
        "OK",
        {
          status: 200,
        }
      );
    }


    // ========================================================
    // DETERMINE CREDIT AMOUNT
    // ========================================================

    let creditsToGrant =
      productConfig.credits;


    // ========================================================
    // RFND
    // ========================================================
    //
    // We don't subtract credits here.
    //
    // Refund handling should be tied to an entitlement system
    // rather than blindly reducing a user's current balance,
    // because the customer may already have spent some credits.
    //
    // For now we record the refund.
    // ========================================================

    if (
      transactionType === "RFND"
    ) {

      creditsToGrant = 0;
    }


    // ========================================================
    // BILL
    // ========================================================
    //
    // For now BILL receives the same product credit amount.
    //
    // You can change this later if your recurring plans have
    // different rebill credit amounts.
    // ========================================================

    if (
      transactionType === "BILL"
    ) {

      creditsToGrant =
        productConfig.credits;
    }


    // ========================================================
    // INSERT TRANSACTION FIRST
    // ========================================================

    const { data: insertedTransaction, error: insertError } =
      await supabaseAdmin
        .from("jvzoo_transactions")
        .insert({

          transaction_id:
            transactionId,

          paykey,

          prekey:
            prekey || null,

          transaction_type:
            transactionType,

          transaction_status:
            transactionStatus || null,

          total:
            total
              ? Number(total)
              : null,

          payment_method:
            paymentMethod || null,

          transaction_date:
            date,

          product_id:
            productId,

          product_name:
            productName || null,

          product_type:
            productType || null,

          customer_email:
            customerEmail,

          customer_first_name:
            customerFirstName || null,

          customer_last_name:
            customerLastName || null,

          customer_ip:
            customerIp || null,

          customer_phone:
            customerPhone || null,

          vendor_id:
            vendorId || null,

          vendor_name:
            vendorName || null,

          vendor_email:
            vendorEmail || null,

          affiliate_id:
            affiliateId || null,

          affiliate_name:
            affiliateName || null,

          affiliate_email:
            affiliateEmail || null,

          tid:
            tid || null,

          other_params:
            otherParams || null,

          tax_total:
            taxTotal
              ? Number(taxTotal)
              : null,

          vat_tax:
            vatTax
              ? Number(vatTax)
              : null,

          national_sales_tax:
            nationalSalesTax
              ? Number(nationalSalesTax)
              : null,

          international_sales_tax:
            internationalSalesTax
              ? Number(internationalSalesTax)
              : null,

          shipping_fee:
            shippingFee
              ? Number(shippingFee)
              : null,

          start_date:
            startDate || null,

          end_date:
            endDate || null,

          next_payment_date:
            nextPaymentDate || null,

          cverify:
            incomingVerify,

          transaction_payouts:
            transactionPayouts,

          profile_id:
            profile.id,

          credits_granted:
            0,

          raw_payload:
            Object.fromEntries(formData.entries()),
        })

        .select("id")
        .single();


    if (insertError) {

      /**
       * A duplicate transaction could have arrived between
       * our initial check and this insert.
       *
       * PostgreSQL UNIQUE constraint protects us.
       */

      if (
        insertError.code === "23505"
      ) {

        console.log(
          "JVZoo transaction already exists:",
          transactionId
        );

        return new NextResponse(
          "OK",
          {
            status: 200,
          }
        );
      }


      console.error(
        "Failed to insert JVZoo transaction:",
        insertError
      );

      return new NextResponse(
        "Database error",
        {
          status: 500,
        }
      );
    }


    // ========================================================
    // APPLY CREDITS
    // ========================================================

    if (
      creditsToGrant > 0 &&
      (
        transactionType === "SALE" ||
        transactionType === "BILL"
      )
    ) {

      const {
        data: newBalance,
        error: creditError,
      } = await supabaseAdmin.rpc(
        "add_jvzoo_credits",
        {
          p_profile_id:
            profile.id,

          p_credits:
            creditsToGrant,
        }
      );


      if (creditError) {

        console.error(
          "Failed to grant credits:",
          creditError
        );

        /**
         * IMPORTANT:
         *
         * The transaction was already inserted.
         *
         * This is intentional because we need the transaction
         * record for debugging/reconciliation.
         *
         * We update credits_granted only after the credit
         * operation succeeds.
         */

        return new NextResponse(
          "Credit processing failed",
          {
            status: 500,
          }
        );
      }


      // ======================================================
      // UPDATE TRANSACTION WITH CREDIT INFORMATION
      // ======================================================

      const {
        error: updateTransactionError,
      } = await supabaseAdmin
        .from("jvzoo_transactions")
        .update({
          credits_granted:
            creditsToGrant,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          insertedTransaction.id
        );


      if (updateTransactionError) {

        console.error(
          "Failed to update transaction credit record:",
          updateTransactionError
        );

        /**
         * Credits were successfully granted even if the
         * transaction metadata update failed.
         *
         * Do NOT grant credits again.
         */

        return new NextResponse(
          "OK",
          {
            status: 200,
          }
        );
      }


      console.log(
        "JVZoo credits granted:",
        {
          transactionId,
          customerEmail,
          productId,
          credits: creditsToGrant,
          newBalance,
        }
      );
    }


    // ========================================================
    // RFND LOGGING
    // ========================================================

    if (
      transactionType === "RFND"
    ) {

      console.log(
        "JVZoo refund received:",
        {
          transactionId,
          customerEmail,
          productId,
        }
      );

      /**
       * Currently we DO NOT subtract credits.
       *
       * Refund entitlement handling can be added later.
       */
    }


    // ========================================================
    // SUCCESS
    // ========================================================

    return new NextResponse(
      "OK",
      {
        status: 200,
      }
    );


  } catch (error) {

    console.error(
      "JVZoo IPN unexpected error:",
      error
    );

    return new NextResponse(
      "Internal server error",
      {
        status: 500,
      }
    );
  }
}