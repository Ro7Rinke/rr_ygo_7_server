/*
  Warnings:

  - A unique constraint covering the columns `[user_deck_id,card_id,slot]` on the table `user_deck_cards` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "user_deck_cards_user_deck_id_card_id_key";

-- CreateIndex
CREATE UNIQUE INDEX "user_deck_cards_user_deck_id_card_id_slot_key" ON "user_deck_cards"("user_deck_id", "card_id", "slot");
