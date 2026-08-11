"use client";

import Image from "next/image";
import { motion } from "framer-motion";

interface Props {
  page: number;
  image: string;
}

export default function MushafViewer({
  page,
  image,
}: Props) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        scale: 0.97,
      }}
      animate={{
        opacity: 1,
        scale: 1,
      }}
      transition={{
        duration: 0.35,
      }}
      className="flex justify-center"
    >
      <div className="overflow-hidden rounded-3xl bg-white shadow-2xl">
        <Image
          src={image}
          alt={`Quran Page ${page}`}
          width={900}
          height={1300}
          priority
          className="h-auto w-full max-w-4xl object-contain"
        />
      </div>
    </motion.div>
  );
}