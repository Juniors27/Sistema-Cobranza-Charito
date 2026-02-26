"use client"
import  PagosForm from "@/components/dashboard/pagos/PagosForm"
import { usePagos } from "@/src/hooks/usePagos"

export default function PagosPage() {
  const PagosPage = usePagos()
  return <PagosForm {...PagosPage}/>
}