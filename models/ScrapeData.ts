import mongoose, { Document, Model, Schema } from "mongoose";

export interface IScrapeData extends Document {
  url: string;
  images: string[];
  accordion: string[];
  text: string;
}

const ScrapeDataSchema: Schema<IScrapeData> = new Schema({
  url: { type: String, required: true, unique: true },
  images: [{ type: String }],
  accordion: [{ type: String }],
  text: { type: String },
});

const ScrapeDataModel: Model<IScrapeData> =
  mongoose.models.ScrapeData || mongoose.model("ScrapeData", ScrapeDataSchema);

export default ScrapeDataModel;
