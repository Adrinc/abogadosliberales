| column_name           | data_type                |
| --------------------- | ------------------------ |
| ticket_id             | bigint                   |
| qr_code               | text                     |
| ticket_status         | text                     |
| scanned_at            | timestamp with time zone |
| ticket_created_at     | timestamp with time zone |
| qr_image_id           | bigint                   |
| qr_image_url          | text                     |
| qr_image_name         | text                     |
| qr_image_type         | text                     |
| customer_id           | bigint                   |
| first_name            | text                     |
| last_name             | text                     |
| email                 | text                     |
| mobile_phone          | text                     |
| customer_status       | text                     |
| event_id              | bigint                   |
| event_name            | text                     |
| event_description     | text                     |
| event_start           | timestamp with time zone |
| event_end             | timestamp with time zone |
| event_location        | text                     |
| ticket_price          | numeric(10,2)            |
| event_payment_id      | bigint                   |
| payment_amount        | numeric(10,2)            |
| currency              | text                     |
| payment_method        | text                     |
| payment_status        | text                     |
| paypal_transaction_id | text                     |
| ippay_transaction_id  | text                     |
| credit_card_id        | bigint                   |
| card_last_four        | text                     |
| card_brand            | text                     |
| card_type             | text                     |
| scanned_by_id         | uuid                     |
| scanned_by_first_name | text                     |
| scanned_by_last_name  | text                     |
| customer_category     | text                     |
| customer_category_id  | bigint                   |